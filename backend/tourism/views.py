from django.db.models import Count, Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import PontoTuristico, Provincia
from .serializers import (
    PontoTuristicoDetailSerializer,
    PontoTuristicoListSerializer,
    ProvinciaDetailSerializer,
    ProvinciaListSerializer,
)


class ProvinciaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Provincia.objects.filter(is_active=True)
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProvinciaDetailSerializer
        return ProvinciaListSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        return qs.annotate(
            total_pontos=Count("pontos_turisticos", filter=Q(pontos_turisticos__is_active=True))
        )


class PontoTuristicoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PontoTuristico.objects.filter(is_active=True)
    lookup_field = "slug"
    filterset_fields = ["categoria", "provincia", "destaque"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PontoTuristicoDetailSerializer
        return PontoTuristicoListSerializer

    @action(detail=False, methods=["get"])
    def destaques(self, request):
        """Pontos turísticos em destaque para a Home."""
        qs = self.get_queryset().filter(destaque=True)[:8]
        return Response(PontoTuristicoListSerializer(qs, many=True).data)
