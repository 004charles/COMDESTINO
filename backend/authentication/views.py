from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Device
from .serializers import DeviceSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


class LoginView(APIView):
    """Login com username, telefone ou e-mail."""

    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = (request.data.get("username") or request.data.get("phone") or request.data.get("email") or "").strip()
        password = request.data.get("password") or ""

        if not identifier or not password:
            return Response(
                {"detail": "Preencha todos os campos."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = None
        if "@" in identifier:
            user = User.objects.filter(email__iexact=identifier).first()
        else:
            user = (
                User.objects.filter(username__iexact=identifier).first()
                or User.objects.filter(phone=identifier).first()
                or User.objects.filter(phone=identifier.replace(" ", "")).first()
            )

        if user and user.check_password(password):
            if not user.is_active:
                return Response({"detail": "Conta desativada."}, status=400)
            auth_user = user
        else:
            auth_user = authenticate(username=identifier, password=password)

        if not auth_user:
            return Response(
                {"detail": "Credenciais inválidas. Verifique o utilizador e a senha."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(auth_user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            }
        )


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class DeviceRegisterView(generics.CreateAPIView):
    serializer_class = DeviceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        from rest_framework_simplejwt.tokens import RefreshToken

        refresh = request.data.get("refresh")
        if refresh:
            RefreshToken(refresh).blacklist()
        return Response({"detail": "Sessão terminada."})
