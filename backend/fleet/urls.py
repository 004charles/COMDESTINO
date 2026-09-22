from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("empresas", views.EmpresaViewSet, basename="empresa")
router.register("motoristas", views.MotoristaViewSet, basename="motorista")
router.register("autocarros", views.AutocarroViewSet, basename="autocarro")

urlpatterns = router.urls
