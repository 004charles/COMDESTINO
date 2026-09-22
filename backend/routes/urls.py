from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("rotas", views.RotaViewSet, basename="rota")
router.register("horarios", views.HorarioViewSet, basename="horario")

urlpatterns = router.urls
