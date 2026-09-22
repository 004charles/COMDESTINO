from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Device, User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label="Confirmar senha")

    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email", "phone", "password", "password2")

    def validate_username(self, value):
        if not value or len(value) < 3:
            raise serializers.ValidationError("O utilizador deve ter pelo menos 3 caracteres.")
        return value

    def validate_phone(self, value):
        # Aceita vazio ou número angolano com pelo menos 9 dígitos
        if not value:
            return ""
        digits = "".join(c for c in value if c.isdigit())
        if len(digits) < 9:
            raise serializers.ValidationError("Telefone inválido. Ex: +244 923 000 000")
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password2"):
            raise serializers.ValidationError({"password2": "As senhas não coincidem."})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    province_name = serializers.CharField(source="province.nome", read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email", "phone", "avatar", "province", "province_name")
        read_only_fields = ("id",)


class DeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Device
        fields = ("id", "push_token", "platform")
        read_only_fields = ("id",)
