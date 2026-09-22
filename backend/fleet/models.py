from django.db import models

from core.models import TimeStampedModel


class Empresa(TimeStampedModel):
    """Empresa operadora de transportes rodoviários."""

    nome = models.CharField(max_length=200, unique=True)
    logo = models.ImageField(upload_to="empresas/", null=True, blank=True)
    telefone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "empresa"
        verbose_name_plural = "empresas"

    def __str__(self):
        return self.nome


class Motorista(TimeStampedModel):
    """Motorista da frota."""

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="motoristas")
    nome = models.CharField(max_length=200)
    telefone = models.CharField(max_length=20, blank=True)
    numero_licenca = models.CharField("nº de licença", max_length=50, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "motorista"
        verbose_name_plural = "motoristas"

    def __str__(self):
        return self.nome


class Autocarro(TimeStampedModel):
    """Autocarro da frota."""

    CLASSES = [
        ("comum", "Comum"),
        ("conforto", "Conforto"),
        ("executivo", "Executivo"),
    ]

    empresa = models.ForeignKey(Empresa, on_delete=models.CASCADE, related_name="autocarros")
    matricula = models.CharField("matrícula", max_length=20, unique=True)
    modelo = models.CharField(max_length=100)
    classe = models.CharField(max_length=20, choices=CLASSES, default="comum")
    total_assentos = models.PositiveIntegerField("total de assentos", default=50)
    layout_assentos = models.JSONField(
        "layout dos assentos",
        null=True,
        blank=True,
        help_text="Ex: linhas de assentos 2+2, 1+2, etc.",
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "autocarro"
        verbose_name_plural = "autocarros"

    def __str__(self):
        return f"{self.matricula} ({self.modelo})"
