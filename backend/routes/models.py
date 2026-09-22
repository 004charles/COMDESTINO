from django.db import models

from core.models import TimeStampedModel
from fleet.models import Autocarro, Empresa
from tourism.models import Provincia


class Rota(TimeStampedModel):
    """Rota de autocarro entre duas províncias."""

    origem = models.ForeignKey(
        Provincia, on_delete=models.PROTECT, related_name="rotas_origem", verbose_name="origem"
    )
    destino = models.ForeignKey(
        Provincia, on_delete=models.PROTECT, related_name="rotas_destino", verbose_name="destino"
    )
    empresa = models.ForeignKey(Empresa, on_delete=models.PROTECT, related_name="rotas")
    distancia_km = models.DecimalField(
        "distância (km)", max_digits=7, decimal_places=1, null=True, blank=True
    )
    preco_base = models.DecimalField(
        "preço base (Kz)", max_digits=10, decimal_places=2
    )
    duracao_estimada_min = models.PositiveIntegerField(
        "duração estimada (min)", default=0
    )
    is_active = models.BooleanField("ativa", default=True)

    class Meta:
        verbose_name = "rota"
        verbose_name_plural = "rotas"
        ordering = ["origem__nome", "destino__nome"]
        unique_together = ("origem", "destino", "empresa")

    def __str__(self):
        return f"{self.origem} → {self.destino} ({self.empresa})"


class Horario(TimeStampedModel):
    """Horário de partida de uma rota."""

    DIAS_SEMANA = [
        (0, "Seg"), (1, "Ter"), (2, "Qua"), (3, "Qui"),
        (4, "Sex"), (5, "Sáb"), (6, "Dom"),
    ]

    rota = models.ForeignKey(Rota, on_delete=models.CASCADE, related_name="horarios")
    autocarro = models.ForeignKey(
        Autocarro, on_delete=models.PROTECT, related_name="horarios"
    )
    hora_saida = models.TimeField("hora de saída")
    hora_chegada = models.TimeField("hora de chegada")
    dias_semana = models.JSONField(
        "dias da semana",
        default=list,
        help_text="Lista de inteiros 0=Seg ... 6=Dom. Vazio = todos os dias.",
    )
    preco = models.DecimalField("preço (Kz)", max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "horário"
        verbose_name_plural = "horários"
        ordering = ["hora_saida"]
        unique_together = ("rota", "autocarro", "hora_saida")

    def __str__(self):
        return f"{self.rota} às {self.hora_saida}"
