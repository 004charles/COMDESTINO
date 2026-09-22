from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("provincias", views.ProvinciaViewSet, basename="provincia")
router.register("pontos-turisticos", views.PontoTuristicoViewSet, basename="pontoturistico")

urlpatterns = router.urls
