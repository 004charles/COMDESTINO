from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers

from routes.models import Horario
from routes.serializers import HorarioSerializer
from tourism.serializers import ProvinciaListSerializer

from .models import Assento, Bilhete, Reserva


class AssentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assento
        fields = ("id", "numero", "passageiro_nome", "passageiro_telefone", "passageiro_documento")
        read_only_fields = ("id",)


class BilheteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bilhete
        fields = ("id", "codigo", "qr_code", "status", "created_at")
        read_only_fields = ("id", "codigo", "qr_code", "status")


class ReservaListSerializer(serializers.ModelSerializer):
    rota_resumo = serializers.SerializerMethodField()
    assentos = AssentoSerializer(many=True, read_only=True)
    bilhete = BilheteSerializer(read_only=True)

    class Meta:
        model = Reserva
        fields = (
            "id", "status", "metodo_pagamento", "preco_total", "data_viagem",
            "expira_em", "assentos", "bilhete", "rota_resumo", "created_at",
        )

    def get_rota_resumo(self, obj):
        h = obj.horario
        return {
            "origem": h.rota.origem.nome,
            "destino": h.rota.destino.nome,
            "empresa": h.rota.empresa.nome,
            "hora_saida": str(h.hora_saida),
            "hora_chegada": str(h.hora_chegada),
        }


class ReservaCreateSerializer(serializers.Serializer):
    """Criação de reserva: lock de assentos por 10 minutos."""

    horario = serializers.PrimaryKeyRelatedField(queryset=Horario.objects.all())
    data_viagem = serializers.DateField()
    metodo_pagamento = serializers.ChoiceField(choices=Reserva.METODOS_PAGAMENTO, default="MCX")
    assentos = AssentoSerializer(many=True, min_length=1)

    def validate_data_viagem(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("A data da viagem não pode ser no passado.")
        return value

    def validate(self, attrs):
        from routes.models import Horario

        horario: Horario = attrs["horario"]
        data = attrs["data_viagem"]
        assentos = attrs["assentos"]

        # Assentos duplicados no pedido
        numeros = [a["numero"] for a in assentos]
        if len(numeros) != len(set(numeros)):
            raise serializers.ValidationError({"assentos": "Assentos duplicados no pedido."})

        # Capacidade
        if len(numeros) > horario.autocarro.total_assentos:
            raise serializers.ValidationError({"assentos": "Mais assentos que a capacidade do autocarro."})

        # Ocupação
        ocupados = Assento.ocupados(horario, data)
        conflitos = set(numeros) & ocupados
        if conflitos:
            raise serializers.ValidationError(
                {"assentos": f"Assentos já ocupados: {', '.join(sorted(conflitos))}"}
            )

        attrs["preco_total"] = horario.preco * len(numeros)
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        assentos_data = validated_data.pop("assentos")

        reserva = Reserva.objects.create(
            utilizador=request.user,
            preco_total=validated_data.pop("preco_total"),
            expira_em=timezone.now() + timedelta(minutes=10),
            **validated_data,
        )
        Assento.objects.bulk_create(
            [Assento(reserva=reserva, **a) for a in assentos_data]
        )
        return reserva


class PagamentoSerializer(serializers.Serializer):
    """Simulação de pagamento Multicaixa Express."""

    referencia = serializers.CharField(max_length=50, required=False, allow_blank=True)
