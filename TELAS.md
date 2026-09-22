# Telas do App Destino - MVP

Paleta: **Verde vibrante `#00A651`** + **Amarelo dourado `#FFD700`** — minimalista e rápida.

---

## 1. Autenticação

### 1.1 Login
- **Rota:** `/login`
- Elementos: logo Destino, campos Email/Telefone + Sena, botão "Entrar" (verde), link "Criar conta", link "Esqueci a senha"
- Ação: `POST /api/auth/login/` → guarda JWT no MMKV

### 1.2 Registo
- **Rota:** `/register`
- Elementos: Nome, Telefone (+244), Email, Sena, Confirmar sena, checkbox termos
- Ação: `POST /api/auth/register/`

### 1.3 Recuperar Sena
- **Rota:** `/forgot-password`
- Elementos: campo telefone/email, botão "Enviar código"
- Segunda etapa: código OTP + nova sena

---

## 2. Home (Tab Principal)

### 2.1 Home — Pesquisa de Rotas
- **Rota:** `/` (tab Home)
- Elementos:
  - Header verde com saudação ("Olá, {nome}") + ícone notificações
  - **Card de pesquisa** (sobreposto ao header):
    - Campo **Origem** (dropdown de províncias)
    - Campo **Destino** (dropdown de províncias)
    - Botão swap ⇅ entre origem/destino
    - Botão circular amarelo **Pesquisar** 🔍
    - Data de viagem (opcional, datepicker)
  - **Destaques de Turismo** — carrossel horizontal de cartões (imagem + nome do ponto turístico)
  - **Rotas populares** — lista de pares origem→destino com preços a partir de
  - **Promoções** — banner dourado com descontos
- Ações: pesquisar → `/booking/search-results`

### 2.2 Resultados de Pesquisa
- **Rota:** `/booking/search-results`
- Elementos: header com rota (Luanda → Huambo), filtros (hora, preço, empresa), lista de cartões de viagem:
  - Empresa + autocarro
  - Horário saída → chegada
  - Duração
  - Assentos disponíveis
  - Preço (Kz) em destaque dourado
  - Botão "Escolher" (verde)
- Ação: selecionar → `/booking/seats`

---

## 3. Explorar (Guia Turístico — Tab)

### 3.1 Explorar — Províncias
- **Rota:** `/explore`
- Elementos:
  - Header verde "Explorar Angola"
  - Barra de busca de províncias/pontos
  - Filtros por categoria (Quedas, Parques, Cultura, Praias, História)
  - **Grid 2 colunas de cartões de Província** (imagem, nome, nº de pontos turísticos)
- Dados: `GET /api/provincias/`

### 3.2 Detalhe da Província
- **Rota:** `/explore/provincia/[id]`
- Elementos: banner imagem, nome, descrição, mapa estático, lista de PontoTuristico (card: foto, nome, distância, avaliação ⭐)

### 3.3 Detalhe do Ponto Turístico
- **Rota:** `/explore/ponto/[id]`
- Elementos:
  - Galeria de imagens (carrossel)
  - Nome + categoria + avaliação
  - Descrição longa
  - Informações: localização, horário, preço de entrada
  - Secção "Como chegar": mostra rotas de autocarro para o destino
  - **Botão CTA dourado: "Ir para o Destino"** 🚌
- Ação: `Ir para o Destino` → `/booking/search?destino={provincia}` (pré-preenche pesquisa)

---

## 4. Fluxo de Reserva

### 4.1 Seleção de Assentos
- **Rota:** `/booking/seats?rota_id={id}&data={date}`
- Elementos:
  - Header: resumo da viagem (rota, data, hora)
  - **Mapa de assentos** — layout do autocarro (ex: 2+2):
    - Disponível: branco com borda cinza
    - Selecionado: verde `#00A651`
    - Ocupado: cinza escuro (não clicável)
    - Preferencial/PMR: dourado
  - Legenda de cores
  - Botão flutuante: "Continuar (n assentos) — {preço} Kz"
- Ação: `GET /api/rotas/{id}/assentos/?data=` → `POST /api/reservas/` (lock de 10 min)

### 4.2 Formulário do Passageiro
- **Rota:** `/booking/passenger`
- Elementos (repete por assento escolhido):
  - Nome completo, Telefone, BI/Passaporte (opcional)
  - Checkbox: "Sou eu mesmo" (preenche dados do user logado)
- Botão "Ir para Pagamento" (verde)

### 4.3 Checkout — Multicaixa Express (MCX)
- **Rota:** `/booking/payment`
- Elementos:
  - Resumo do pedido: rota, assentos, passageiros, **preço total**
  - **Método de pagamento** (radio):
    - ✅ Multicaixa Express (recomendado) — ícone
    - Pagamento na bilheteira (pagar no dia)
  - Se MCX: campo **Número de telefone** (+244) para chamada MCX
  - Botão "Pagar {total} Kz" (verde, full-width)
- **Estado de processamento:** spinner + "A aguardar confirmação MCX..."
- **Sucesso:** ✓ animação verde → redireciona ao bilhete
- **Falha:** ✗ vermelho + botão "Tentar novamente"
- Simulação MVP: `POST /api/reservas/{id}/pagar/` → status `PENDENTE` → webhook/mock confirma em ~5s

### 4.4 Sucesso do Bilhete
- **Rota:** `/booking/success/{bilhete_id}`
- Elementos: check verde animado, "Reserva confirmada!", resumo, botões "Ver Bilhete" + "Voltar ao Início"

---

## 5. Bilheteira (Tab)

### 5.1 Lista de Bilhetes (offline)
- **Rota:** `/tickets`
- Elementos:
  - Header "A Minha Bilheteira"
  - **Tabs:** Próximos | Usados | Cancelados
  - **Cartões de bilhete:**
    - Rota (origem → destino), data/hora
    - Assentos (ex: 3A, 3B)
    - Código + mini QR
    - Status badge: Confirmado (verde) / Pendente (dourado) / Usado (cinza)
  - Indicador offline: banner "A ver cópia offline" quando sem rede
- Armazenamento: MMKV (cópia local dos bilhetes, atualizado via API)

### 5.2 Detalhe do Bilhete + QR Code
- **Rota:** `/tickets/[id]`
- Elementos:
  - **QR Code grande** (centro, branco, alta resolução) — para leitura pelo motorista
  - Dados: Código do bilhete, passageiro, assentos, rota, empresa, data/hora, poltrona
  - Preço pago + método
  - Botões: "Partilhar" 📤, "Guardar imagem" 💾
  - Dashed separator visual (corte de bilhete)
- QR payload: `{bilhete_uuid}` verificável via `GET /api/bilhetes/{uuid}/verificar/`

### 5.3 Verificação (interno / motorista — opcional MVP)
- **Rota:** `/tickets/scan`
- Elementos: câmara scanner, overlay QR, resultado ✓/✗ do bilhete

---

## 6. Perfil (Tab)

### 6.1 Perfil
- **Rota:** `/profile`
- Elementos: avatar, nome, telefone/email, menu:
  - Dados pessoais
  - Histórico de viagens
  - Notificações
  - Idioma (PT)
  - Ajuda / Contacto
  - **Terminar sessão** (vermelho)

---

## 7. Componentes Transversais

| Componente | Descrição |
|---|---|
| `TabBar` | 4 tabs: Home (casa), Explorar (mapa), Bilhetes (bilhete), Perfil (user) — ícones ativos em verde |
| `PrimaryButton` | Verde `#00A651`, cantos arredondados, pressed escurece |
| `GoldButton` | Dourado `#FFD700` com texto preto — CTAs turísticos |
| `RouteCard` | Cartão de rota da home e resultados |
| `SeatMap` | Grelha interativa de assentos |
| `TicketCard` | Resumo de bilhete na lista |
| `QRCodeView` | QR estático do bilhete |
| `EmptyState` | Estado vazio (sem bilhetes, sem resultados) |
| `Skeleton` | Shimmer loading em cinza |
| `Toast` | Notificação (sucesso verde / erro vermelho) |
| `OfflineBanner` | Banner dourado "Sem ligação — a mostrar dados guardados" |

---

## Mapa de Navegação

```
(login/register)
      │
      ▼
   ┌─────── Tab Navigator ───────┐
   │                             │
Home  →  Explorar  →  Bilhetes  →  Perfil
 │        │              │
 │        │              └── Ticket/[id] (QR)
 │        └── Province/[id] → Ponto/[id]
 │                              └── "Ir p/ Destino" ─┐
 └── Search-Results ───────────────────────────────┘
          │
          ▼
       Seats → Passenger → Payment → Success
```

---

## Notas para o MVP

1. **Offline-first na Bilheteira:** bilhetes confirmados ficam sempre no MMKV — abrem sem internet.
2. **MCX simulado:** sem SDK real na fase 1; endpoint mock com status `PENDENTE → PAGO` após delay.
3. **QR estático:** UUID no payload, validação por leitura no servidor.
4. **Performance:** imagens com cache (expo-image), listas virtuais (FlashList), skeletons em tudo.
5. **PT-AO:** toda a UI em português angolano, moeda **Kz**.
