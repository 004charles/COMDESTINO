from django.contrib.auth.models import AbstractUser
from django.db import models

from core.models import TimeStampedModel


class User(AbstractUser):
    """Utilizador da plataforma Destino."""

    phone = models.CharField("telefone", max_length=20, unique=True, blank=True)
    province = models.ForeignKey(
        "tourism.Provincia",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="users",
        verbose_name="província",
    )
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)

    class Meta:
        verbose_name = "utilizador"
        verbose_name_plural = "utilizadores"

    def __str__(self):
        return self.get_full_name() or self.username


class Device(TimeStampedModel):
    """Dispositivo móvel registado para notificações push."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="devices")
    push_token = models.CharField(max_length=255, unique=True)
    platform = models.CharField(max_length=20, default="android")

    def __str__(self):
        return f"{self.user} - {self.platform}"
