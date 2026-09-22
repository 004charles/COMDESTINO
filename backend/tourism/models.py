from django.db import models

from core.models import TimeStampedModel


class Provincia(TimeStampedModel):
    """Província de Angola (18 províncias)."""

    nome = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    capital = models.CharField("capital", max_length=100, blank=True)
    descricao = models.TextField(blank=True)
    imagem = models.ImageField(upload_to="provincias/", null=True, blank=True)
    is_active = models.BooleanField("ativa", default=True)

    class Meta:
        verbose_name = "província"
        verbose_name_plural = "províncias"
        ordering = ["nome"]

    def __str__(self):
        return self.nome


class PontoTuristico(TimeStampedModel):
    """Ponto turístico (Quedas de Kalandula, Fenda da Tundavala, ...)."""

    CATEGORIAS = [
        ("quedas", "Quedas"),
        ("parque", "Parque Natural"),
        ("cultura", "Cultura"),
        ("praia", "Praia"),
        ("historia", "História"),
        ("montanha", "Montanha"),
        ("outro", "Outro"),
    ]

    provincia = models.ForeignKey(
        Provincia, on_delete=models.CASCADE, related_name="pontos_turisticos"
    )
    nome = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    categoria = models.CharField(max_length=20, choices=CATEGORIAS, default="outro")
    descricao = models.TextField(blank=True)
    imagem = models.ImageField(upload_to="pontos_turisticos/", null=True, blank=True)
    endereco = models.CharField(max_length=255, blank=True)
    preco_entrada = models.DecimalField(
        "preço de entrada (Kz)", max_digits=10, decimal_places=2, default=0
    )
    horario = models.CharField(max_length=100, blank=True, help_text="Ex: 08:00 - 17:00")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    destaque = models.BooleanField("destaque na home", default=False)
    is_active = models.BooleanField("ativo", default=True)

    class Meta:
        verbose_name = "ponto turístico"
        verbose_name_plural = "pontos turísticos"
        ordering = ["-destaque", "nome"]

    def __str__(self):
        return self.nome
