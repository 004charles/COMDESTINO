# Arquitetura do Sistema - Destino MVP

## Visão Geral

```
destino/
├── backend/                 # Django + DRF API
│   ├── config/             # Configurações do projeto Django
│   ├── core/               # App principal (models, views, serializers)
│   ├── authentication/     # App de autenticação (JWT)
│   ├── routes/             # App de rotas e horários
│   ├── bookings/           # App de reservas e bilhetes
│   ├── tourism/            # App de pontos turísticos
│   ├── fleet/              # App de gestão de frota
│   ├── media/              # Arquivos de mídia (QR codes, imagens)
│   ├── static/             # Arquivos estáticos
│   ├── requirements/       # Dependências por ambiente
│   ├── scripts/            # Scripts de utilidade
│   └── tests/              # Testes automatizados
│
├── frontend/               # React Native 
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── screens/        # Telas principais
│   │   ├── navigation/     # Configuração de navegação
│   │   ├── services/       # API services, storage
│   │   ├── store/          # Estado global (Redux/Zustand/Context)
│   │   ├── hooks/          # Custom hooks
│   │   ├── utils/          # Utilitários, helpers
│   │   ├── constants/      # Cores, temas, configurações
│   │   ├── types/          # TypeScript interfaces
│   │   └── assets/         # Imagens, fontes, ícones
│   ├── app.json            # Config Expo
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                   # Documentação técnica
│   ├── api.md
│   ├── database.md
│   └── deployment.md
│
├── docker/                 # Docker configs
│   ├── backend.Dockerfile
│   ├── frontend.Dockerfile
│   └── docker-compose.yml
│
└── README.md
```

## Tecnologias Escolhidas

### Backend
| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Framework | Django 5.x + DRF | Maturidade, admin nativo, ORM robusto, segurança |
| Auth | djangorestframework-simplejwt | JWT stateless, refresh tokens, blacklist |
| DB | PostgreSQL 16 | Relacional, transações ACID, JSONB para flexibilidade |
| Cache | Redis 7 | Sessões, rate limiting, cache de rotas |
| Task Queue | Celery + Redis | Processamento assíncrono (emails, QR codes, notificações) |
| Docs | drf-spectacular | OpenAPI 3 automático |
| Deploy | Docker + Gunicorn + Nginx | Produção escalável |

### Frontend (React Native com Expo)
| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Framework | React Native 0.74 + Expo SDK 51 | Desenvolvimento rápido, OTA updates, build nativo |
| Linguagem | TypeScript | Type safety, DX superior |
| Navegação | Expo Router (file-based) | Type-safe, deep linking nativo |
| Estado | Zustand + React Query | Simples, performático, cache server-state |
| UI | NativeWind (TailwindCSS) + Reanimated | Estilização utilitária, animações 60fps |
| Forms | React Hook Form + Zod | Validação schema-first |
| Storage | MMKV + AsyncStorage | Performance nativa, persistência offline |
| QR Code | react-native-qrcode-svg | Geração nativa SVG |

### Cores da Marca (Design System)
```typescript
// frontend/src/constants/colors.ts
export const colors = {
  primary: {
    green: '#00A651',      // Verde vibrante - Angola
    greenDark: '#007A3D',
    greenLight: '#E8F5ED',
  },
  secondary: {
    gold: '#FFD700',       // Amarelo dourado
    goldDark: '#CCAC00',
    goldLight: '#FFF8E1',
  },
  neutral: {
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    black: '#000000',
  },
  semantic: {
    success: '#00A651',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};
```

## Padrões Arquiteturais

### Backend: Clean Architecture por Apps
```
core/                    # Domínio compartilhado
├── models/              # AbstractBaseModel, mixins
├── permissions/         # IsOwner, IsAdmin, ReadOnly
├── pagination/          # CustomPageNumberPagination
├── filters/             # DjangoFilterBackend customizado
├── exceptions/          # Handlers globais
└── utils/               # Helpers transversais

routes/                  # Bounded Context: Rotas
├── models.py            # Rota, Horario, Preco
├── views.py             # ViewSets
├── serializers.py       # Serializers aninhados
├── urls.py              # Router registration
├── filters.py           # Filtros de busca
└── services.py          # Lógica de negócio complexa

bookings/                # Bounded Context: Reservas
├── models.py            # Reserva, Bilhete, Assento
├── views.py
├── serializers.py
├── services.py          # Seat locking, payment flow
├── tasks.py             # Celery tasks (QR, email, expiry)
└── signals.py           # Post-save hooks

tourism/                 # Bounded Context: Turismo
├── models.py            # Provincia, PontoTuristico, Avaliacao
├── views.py
├── serializers.py
└── services.py          # Busca geoespacial (PostGIS futuro)

fleet/                   # Bounded Context: Frota
├── models.py            # Autocarro, Empresa, Motorista
├── views.py
└── serializers.py

authentication/          # Bounded Context: Auth
├── models.py            # User (AbstractUser), Device
├── views.py             # Register, Login, Refresh, Me
├── serializers.py
├── tokens.py            # Custom JWT claims
└── backends.py          # Auth backend customizado
```

### Frontend: Feature-Based Structure
```
src/
├── app/                 # Expo Router pages (file-based routing)
│   ├── (auth)/          # Route group: auth screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (app)/           # Route group: authenticated app
│   │   ├── _layout.tsx  # Tab navigator
│   │   ├── index.tsx    # Home
│   │   ├── explore.tsx  # Explorar
│   │   ├── booking/     # Stack: search -> seats -> passenger -> payment
│   │   │   ├── search.tsx
│   │   │   ├── seats.tsx
│   │   │   ├── passenger.tsx
│   │   │   └── payment.tsx
│   │   └── tickets/     # Bilheteira
│   │       ├── index.tsx
│   │       └── [id].tsx # Ticket detail + QR
│   └── _layout.tsx      # Root layout
│
├── features/            # Feature modules (colocated)
│   ├── auth/
│   │   ├── api.ts
│   │   ├── store.ts
│   │   ├── hooks.ts
│   │   └── types.ts
│   ├── routes/
│   │   ├── api.ts
│   │   ├── store.ts
│   │   ├── hooks.ts
│   │   └── types.ts
│   ├── bookings/
│   │   ├── api.ts
│   │   ├── store.ts
│   │   ├── hooks.ts
│   │   ├── components/
│   │   │   ├── SeatMap.tsx
│   │   │   ├── SeatLegend.tsx
│   │   │   └── PassengerForm.tsx
│   │   └── types.ts
│   ├── tourism/
│   │   ├── api.ts
│   │   ├── store.ts
│   │   └── components/
│   │       ├── ProvinceCard.tsx
│   │       └── AttractionCard.tsx
│   └── tickets/
│       ├── api.ts
│       ├── store.ts
│       └── components/
│           ├── TicketCard.tsx
│           └── QRCodeView.tsx
│
├── shared/              # Shared across features
│   ├── components/
│   │   ├── ui/          # Button, Input, Card, Modal, etc.
│   │   ├── layout/      # Header, Footer, Container
│   │   └── forms/       # FormField, Select, DatePicker
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useOffline.ts
│   │   └── useDebounce.ts
│   ├── services/
│   │   ├── api.ts       # Axios instance + interceptors
│   │   ├── storage.ts   # MMKV wrapper
│   │   └── notifications.ts
│   ├── utils/
│   │   ├── date.ts
│   │   ├── currency.ts  # Kz formatting
│   │   └── validation.ts
│   └── constants/
│       ├── colors.ts
│       ├── routes.ts
│       └── config.ts
```

## Comunicação Frontend ↔ Backend

```
┌─────────────┐     HTTPS/REST      ┌─────────────┐
│  Mobile App │ ◄─────────────────► │  Django API │
│ (React Nat) │   JSON + JWT Auth   │  (DRF)      │
└─────────────┘                     └─────────────┘
        │                                    │
        │ WebSocket (futuro)                 │ Celery/Redis
        ▼                                    ▼
┌─────────────┐                     ┌─────────────┐
│  Offline    │                     │  Background │
│  Storage    │                     │  Workers    │
│  (MMKV)     │                     │  (Email,    │
└─────────────┘                     │   QR, Push) │
                                    └─────────────┘
```

## Segurança

- **JWT**: Access token (15min) + Refresh token (7d) com rotação
- **Rate Limiting**: 100 req/min por IP, 1000 req/min por user autenticado
- **CORS**: Apenas domínios permitidos (expo.dev, localhost, domínio produção)
- **Helmet**: Headers de segurança via django-cors-headers + custom middleware
- **Validação**: Serializers DRF + Zod no frontend
- **SQL Injection**: ORM Django (parametrizado)
- **XSS**: React Native não renderiza HTML, sanitização no backend
- **Dados Sensíveis**: Variáveis de ambiente (.env), nunca no código

## Escalabilidade Futura

1. **Microsserviços**: Separar `bookings`, `fleet`, `tourism` em serviços independentes
2. **Message Broker**: RabbitMQ/Kafka para eventos assíncronos entre serviços
3. **CDN**: CloudFront/Cloudflare para assets estáticos e imagens
4. **Read Replicas**: PostgreSQL read replicas para queries de busca
5. **PostGIS**: Busca geoespacial de pontos turísticos "perto de mim"
6. **WebSockets**: Django Channels para tracking de ônibus em tempo real
7. **Multi-tenancy**: Suporte a múltiplas empresas de ônibus (schema-based)