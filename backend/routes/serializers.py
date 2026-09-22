from rest_framework import serializers

from fleet.serializers import AutocarroSerializer, EmpresaSerializer
from tourism.models import Provincia
from tourism.serializers import ProvinciaListSerializer

from .models import Horario, Rota


class HorarioSerializer(serializers.ModelSerializer):
    autocarro_info = AutocarroSerializer(source="autocarro", read_only=True)
    lugares_disponiveis = serializers.SerializerMethodField()
    data = serializers.DateField(required=False, write_only=True)

    class Meta:
        model = Horario
        fields = (
            "id", "hora_saida", "hora_chegada", "dias_semana", "preco",
            "autocarro", "autocarro_info", "lugares_disponiveis", "data", "is_active",
        )

    def get_lugares_disponiveis(self, obj):
        data = self.context.get("data")
        if not data:
            return None
        from bookings.models import Assento

        ocupados = len(Assento.ocupados(obj, data))
        return max(obj.autocarro.total_assentos - ocupados, 0)


class RotaListSerializer(serializers.ModelSerializer):
    origem_nome = serializers.CharField(source="origem.nome", read_only=True)
    destino_nome = serializers.CharField(source="destino.nome", read_only=True)
    empresa_info = EmpresaSerializer(source="empresa", read_only=True)
    preco_minimo = serializers.DecimalField(
        source="preco_base", max_digits=10, decimal_places=2, read_only=True
    )

    class Meta:
        model = Rota
        fields = (
            "id", "origem", "origem_nome", "destino", "destino_nome",
            "empresa", "empresa_info", "preco_minimo", "distancia_km",
            "duracao_estimada_min", "is_active",
        )


class RotaDetailSerializer(RotaListSerializer):
    horarios = serializers.SerializerMethodField()

    class Meta(RotaListSerializer.Meta):
        fields = RotaListSerializer.Meta.fields + ("horarios",)

    def get_horarios(self, obj):
        data = self.context.get("data")
        qs = obj.horarios.filter(is_active=True)
        return HorarioSerializer(qs, many=True, context={**self.context, "data": data}).data


class BuscaRotasSerializer(serializers.Serializer):
    origem = serializers.SlugRelatedField(slug_field="slug", queryset=Provincia.objects.all())
    destino = serializers.SlugRelatedField(slug_field="slug", queryset=Provincia.objects.all())
    data = serializers.DateField(required=False)
