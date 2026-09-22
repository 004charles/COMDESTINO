from datetime import date

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from tourism.models import Provincia

from .models import Horario, Rota
from .serializers import (
    BuscaRotasSerializer,
    HorarioSerializer,
    RotaDetailSerializer,
    RotaListSerializer,
)


class RotaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Rota.objects.filter(is_active=True).select_related(
        "origem", "destino", "empresa"
    )
    lookup_field = "pk"

    def get_serializer_class(self):
        if self.action == "retrieve":
            return RotaDetailSerializer
        return RotaListSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        data = self.request.query_params.get("data")
        if data:
            ctx["data"] = data
        return ctx

    @action(detail=False, methods=["get"])
    def busca(self, request):
        """Busca rotas por origem/destino (?origem=luanda&destino=huambo&data=2026-09-25)."""
        serializer = BuscaRotasSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        origem: Provincia = serializer.validated_data["origem"]
        destino: Provincia = serializer.validated_data["destino"]
        data = serializer.validated_data.get("data")

        qs = self.get_queryset().filter(origem=origem, destino=destino)
        context = {"data": data} if data else {}
        return Response(
            RotaListSerializer(qs, many=True, context=context).data
        )


class HorarioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Horario.objects.filter(is_active=True).select_related(
        "rota", "autocarro", "autocarro__empresa"
    )
    serializer_class = HorarioSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        rota = self.request.query_params.get("rota")
        if rota:
            qs = qs.filter(rota_id=rota)
        return qs

    @action(detail=True, methods=["get"])
    def assentos(self, request, pk=None):
        """Mapa de assentos ocupados para um horário/data."""
        from bookings.models import Assento

        horario = self.get_object()
        data_str = request.query_params.get("data")
        if not data_str:
            return Response({"detail": "Parâmetro 'data' é obrigatório."}, status=400)
        data = date.fromisoformat(data_str)
        ocupados = sorted(Assento.ocupados(horario, data))
        return Response({
            "horario": horario.id,
            "data": data_str,
            "total_assentos": horario.autocarro.total_assentos,
            "ocupados": ocupados,
            "disponiveis": horario.autocarro.total_assentos - len(ocupados),
        })
