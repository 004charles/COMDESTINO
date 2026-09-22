import uuid

from django.db import models
from django.utils import timezone

from core.models import TimeStampedModel
from routes.models import Horario
from tourism.models import Provincia


class Reserva(TimeStampedModel):
    """Reserva de assento(s) numa viagem."""

    STATUS = [
        ("PENDENTE", "Pendente"),
        ("PAGO", "Pago"),
        ("CANCELADO", "Cancelado"),
        ("EXPIRADO", "Expirado"),
    ]

    METODOS_PAGAMENTO = [
        ("MCX", "Multicaixa Express"),
        ("BALCAO", "Pagamento na bilheteira"),
    ]

    utilizador = models.ForeignKey(
        "authentication.User", on_delete=models.CASCADE, related_name="reservas"
    )
    horario = models.ForeignKey(Horario, on_delete=models.PROTECT, related_name="reservas")
    data_viagem = models.DateField("data da viagem")
    status = models.CharField(max_length=10, choices=STATUS, default="PENDENTE")
    metodo_pagamento = models.CharField(
        max_length=10, choices=METODOS_PAGAMENTO, default="MCX"
    )
    preco_total = models.DecimalField("preço total (Kz)", max_digits=10, decimal_places=2)
    expira_em = models.DateTimeField("expira em", null=True, blank=True)
    referencia_mcx = models.CharField(max_length=50, blank=True)

    class Meta:
        verbose_name = "reserva"
        verbose_name_plural = "reservas"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Reserva {self.pk} — {self.utilizador} — {self.status}"

    @property
    def expirada(self):
        return self.expira_em and timezone.now() > self.expira_em


class Assento(TimeStampedModel):
    """Assento ocupado numa reserva."""

    reserva = models.ForeignKey(Reserva, on_delete=models.CASCADE, related_name="assentos")
    numero = models.CharField("número/código", max_length=10)
    passageiro_nome = models.CharField("nome do passageiro", max_length=200)
    passageiro_telefone = models.CharField(max_length=20, blank=True)
    passageiro_documento = models.CharField("BI/Passaporte", max_length=50, blank=True)

    class Meta:
        verbose_name = "assento"
        verbose_name_plural = "assentos"
        unique_together = ("reserva", "numero")

    @classmethod
    def ocupados(cls, horario, data_viagem):
        """Códigos de assento ocupados para um horário/data."""
        return set(
            cls.objects.filter(
                reserva__horario=horario,
                reserva__data_viagem=data_viagem,
                reserva__status__in=["PENDENTE", "PAGO"],
            ).values_list("numero", flat=True)
        )

    def __str__(self):
        return f"{self.numero} — {self.passageiro_nome}"


class Bilhete(TimeStampedModel):
    """Bilhete emitido com QR Code para acesso."""

    STATUS = [
        ("ATIVO", "Ativo"),
        ("USADO", "Usado"),
        ("CANCELADO", "Cancelado"),
    ]

    reserva = models.OneToOneField(Reserva, on_delete=models.CASCADE, related_name="bilhete")
    codigo = models.CharField("código", max_length=36, unique=True, default=uuid.uuid4)
    qr_code = models.ImageField(upload_to="qrcodes/", null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS, default="ATIVO")

    class Meta:
        verbose_name = "bilhete"
        verbose_name_plural = "bilhetes"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Bilhete {self.codigo}"
