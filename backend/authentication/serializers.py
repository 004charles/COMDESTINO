from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Device, User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label="Confirmar senha")

    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "email", "phone", "password", "password2")

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
