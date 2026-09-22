from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Bilhete


class VerificarBilheteView(APIView):
    """Endpoint para o motorista/motorista escanear o QR do bilhete."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, codigo):
        try:
            bilhete = Bilhete.objects.select_related(
                "reserva__utilizador", "reserva__horario__rota"
            ).get(codigo=codigo)
        except Bilhete.DoesNotExist:
            return Response({"valido": False, "motivo": "Bilhete inexistente."}, status=404)

        if bilhete.status != "ATIVO":
            return Response(
                {"valido": False, "motivo": f"Bilhete {bilhete.get_status_display().lower()}."},
                status=400,
            )

        r = bilhete.reserva
        if r.status != "PAGO":
            return Response({"valido": False, "motivo": "Reserva não paga."}, status=400)

        return Response({
            "valido": True,
            "codigo": str(bilhete.codigo),
            "passageiro": r.utilizador.get_full_name() or r.utilizador.username,
            "origem": r.horario.rota.origem.nome,
            "destino": r.horario.rota.destino.nome,
            "data_viagem": str(r.data_viagem),
            "hora_saida": str(r.horario.hora_saida),
            "assentos": list(r.assentos.values_list("numero", flat=True)),
        })
