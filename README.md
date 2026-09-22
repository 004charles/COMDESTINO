# Destino 🚌

MVP da maior plataforma de venda de bilhetes de autocarro interprovinciais e guia turístico de Angola.

## Stack

| Camada | Tecnologia |
|---|---|
| Backend | Django 6 + Django REST Framework + JWT |
| Frontend | React Native (Expo SDK 57) + TypeScript |
| Base de dados | SQLite (dev) → PostgreSQL (produção) |
| Cores | Verde vibrante `#00A651` · Amarelo dourado `#FFD700` |

## Estrutura

```
destino/
├── backend/     # API Django
├── frontend/    # App mobile Expo
├── ARQUITETURA.md
├── TELAS.md
└── README.md
```

## Arranque rápido

### 1. Backend (porta 8010)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_destino    # dados iniciais (18 províncias, rotas, etc.)
python manage.py runserver 8010
```

- API: http://127.0.0.1:8010/api/
- Docs Swagger: http://127.0.0.1:8010/api/docs/
- Admin: http://127.0.0.1:8010/admin/ (criar superuser: `python manage.py createsuperuser`)

### 2. Frontend (Expo)

```bash
cd frontend
npm install
npx expo start
```

- `a` → emulador Android · `w` → web · escaneie o QR com o Expo Go

> **Importante:** o `API_URL` em `frontend/src/services/api.ts` está a apontar para
> `http://192.168.146.9:8010/api` (IP desta máquina na rede WiFi).
> - Dispositivo físico: usa esse IP (tem de estar na mesma rede)
> - Emulador Android: `http://10.0.2.2:8010/api`
> - APK/Codemagic: para fora da rede local precisas de backend público (VPS/domínio)

## Contas de teste

Após correr o seed, cria uma conta pela tela **Registo** do app, ou use o admin Django.

## Fluxo de reserva (MVP)

1. **Home** → pesquisa origem/destino → **Resultados**
2. **Assentos** → escolher poltronas (mapa 2+2)
3. **Passageiro** → dados + método (MCX ou balcão)
4. **Checkout** → simulação Multicaixa Express → bilhete + QR
5. **Bilheteira** → bilhetes guardados para consulta offline

## Endpoints principais

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/api/auth/register/` | Registo |
| POST | `/api/auth/token/` | Login (JWT) |
| GET | `/api/auth/me/` | Perfil |
| GET | `/api/provincias/` | 18 províncias |
| GET | `/api/pontos-turisticos/destaques/` | Destaques home |
| GET | `/api/rotas/busca/?origem=&destino=&data=` | Buscar rotas |
| GET | `/api/horarios/{id}/assentos/?data=` | Mapa de assentos |
| POST | `/api/reservas/` | Criar reserva (lock 10 min) |
| POST | `/api/reservas/{id}/pagar/` | Pagar (MCX simulado) |
| GET | `/api/reservas/minhas/` | Bilheteira |
| GET | `/api/bilhetes/{codigo}/verificar/` | Validar QR |

Docs completos: `/api/docs/` (Swagger UI).

## Comandos úteis

```bash
# Backend
python manage.py makemigrations && python manage.py migrate
python manage.py seed_destino          # repovoar dados
python manage.py test                  # testes
python manage.py createsuperuser       # admin

# Frontend
npx tsc --noEmit                       # typecheck
npx expo lint                          # lint
npx expo start --clear                 # restart limpo
```

## Documentação

- [ARQUITETURA.md](./ARQUITETURA.md) — estrutura de pastas e padrões
- [TELAS.md](./TELAS.md) — todas as telas do MVP
# COMDESTINO
