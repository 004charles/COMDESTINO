from rest_framework import serializers

from .models import Autocarro, Empresa, Motorista


class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ("id", "nome", "logo", "telefone", "email")


class MotoristaSerializer(serializers.ModelSerializer):
    empresa_nome = serializers.CharField(source="empresa.nome", read_only=True)

    class Meta:
        model = Motorista
        fields = ("id", "nome", "telefone", "numero_licenca", "empresa", "empresa_nome")


class AutocarroSerializer(serializers.ModelSerializer):
    empresa_nome = serializers.CharField(source="empresa.nome", read_only=True)

    class Meta:
        model = Autocarro
        fields = (
            "id", "matricula", "modelo", "classe", "total_assentos",
            "layout_assentos", "empresa", "empresa_nome", "is_active",
        )
