from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views, views_verificar

router = DefaultRouter()
router.register("reservas", views.ReservaViewSet, basename="reserva")

urlpatterns = [
    path("", include(router.urls)),
    path("bilhetes/<uuid:codigo>/verificar/", views_verificar.VerificarBilheteView.as_view()),
]
