from rest_framework import permissions, viewsets

from .models import Autocarro, Empresa, Motorista
from .serializers import AutocarroSerializer, EmpresaSerializer, MotoristaSerializer


class EmpresaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Empresa.objects.filter(is_active=True)
    serializer_class = EmpresaSerializer


class MotoristaViewSet(viewsets.ModelViewSet):
    queryset = Motorista.objects.all()
    serializer_class = MotoristaSerializer
    permission_classes = [permissions.IsAdminUser]


class AutocarroViewSet(viewsets.ModelViewSet):
    queryset = Autocarro.objects.all()
    serializer_class = AutocarroSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticatedOrReadOnly()]
        return [permissions.IsAdminUser()]
