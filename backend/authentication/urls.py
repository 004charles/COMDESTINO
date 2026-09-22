from django.urls import path

from . import views

urlpatterns = [
    path("token/", views.LoginView.as_view(), name="auth-login"),
    path("register/", views.RegisterView.as_view(), name="auth-register"),
    path("me/", views.MeView.as_view(), name="auth-me"),
    path("logout/", views.LogoutView.as_view(), name="auth-logout"),
    path("devices/", views.DeviceRegisterView.as_view(), name="auth-device"),
]
