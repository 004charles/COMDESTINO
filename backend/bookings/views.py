import uuid

from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Bilhete, Reserva
from .serializers import PagamentoSerializer, ReservaCreateSerializer, ReservaListSerializer


class ReservaViewSet(viewsets.ModelViewSet):
    """CRUD de reservas com fluxo de pagamento simulado (MCX)."""

    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reserva.objects.filter(utilizador=self.request.user).prefetch_related(
            "assentos", "bilhete", "horario__rota__origem", "horario__rota__destino"
        )

    def get_serializer_class(self):
        if self.action == "create":
            return ReservaCreateSerializer
        return ReservaListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reserva = serializer.save()
        return Response(
            ReservaListSerializer(reserva).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def pagar(self, request, pk=None):
        """Simula confirmação de pagamento MCX → emite bilhete."""
        reserva = self.get_object()
        ser = PagamentoSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        if reserva.status == "PAGO":
            return Response({"detail": "Reserva já paga."}, status=400)
        if reserva.status == "CANCELADO":
            return Response({"detail": "Reserva cancelada."}, status=400)
        if reserva.expirada:
            reserva.status = "EXPIRADO"
            reserva.save(update_fields=["status"])
            return Response({"detail": "Reserva expirada."}, status=400)

        # --- Simulação MCX ---
        # Em produção: criar transação MCX e aguardar webhook de confirmação.
        reserva.status = "PAGO"
        reserva.referencia_mcx = ser.validated_data.get("referencia") or str(uuid.uuid4())[:12]
        reserva.save(update_fields=["status", "referencia_mcx"])

        bilhete, _ = Bilhete.objects.get_or_create(reserva=reserva)
        # QR code gerado de forma síncrona no MVP
        _gerar_qr_code(bilhete)

        return Response(ReservaListSerializer(reserva).data)

    @action(detail=False, methods=["get"])
    def minhas(self, request):
        """Bilheteira: reservas do utilizador (sync offline)."""
        qs = self.get_queryset()
        return Response(ReservaListSerializer(qs, many=True).data)

    def perform_destroy(self, instance):
        if instance.status in ("PAGO",):
            raise permissions.PermissionDenied("Não é possível cancelar uma reserva paga.")
        instance.status = "CANCELADO"
        instance.save(update_fields=["status"])


def _gerar_qr_code(bilhete: Bilhete):
    """Gera imagem QR do código do bilhete."""
    try:
        import qrcode
        from django.core.files.base import ContentFile
        from io import BytesIO

        img = qrcode.make(str(bilhete.codigo))
        buffer = BytesIO()
        img.save(buffer, format="PNG")
        bilhete.qr_code.save(
            f"qr_{bilhete.codigo}.png", ContentFile(buffer.getvalue()), save=True
        )
    except Exception:
        # QR é best-effort no MVP; o código textual continua válido
        pass
