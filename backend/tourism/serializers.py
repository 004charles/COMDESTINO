from rest_framework import serializers

from .models import PontoTuristico, Provincia


class ProvinciaListSerializer(serializers.ModelSerializer):
    total_pontos = serializers.IntegerField(read_only=True)

    class Meta:
        model = Provincia
        fields = ("id", "nome", "slug", "capital", "imagem", "total_pontos")


class ProvinciaDetailSerializer(serializers.ModelSerializer):
    pontos_turisticos = serializers.SerializerMethodField()

    class Meta:
        model = Provincia
        fields = (
            "id", "nome", "slug", "capital", "descricao", "imagem",
            "pontos_turisticos", "created_at",
        )

    def get_pontos_turisticos(self, obj):
        qs = obj.pontos_turisticos.filter(is_active=True)
        return PontoTuristicoListSerializer(qs, many=True).data


class PontoTuristicoListSerializer(serializers.ModelSerializer):
    provincia_nome = serializers.CharField(source="provincia.nome", read_only=True)

    class Meta:
        model = PontoTuristico
        fields = (
            "id", "nome", "slug", "categoria", "imagem", "provincia",
            "provincia_nome", "destaque", "preco_entrada",
        )


class PontoTuristicoDetailSerializer(serializers.ModelSerializer):
    provincia_nome = serializers.CharField(source="provincia.nome", read_only=True)

    class Meta:
        model = PontoTuristico
        fields = (
            "id", "nome", "slug", "categoria", "descricao", "imagem",
            "provincia", "provincia_nome", "endereco", "preco_entrada",
            "horario", "latitude", "longitude", "destaque", "created_at",
        )
