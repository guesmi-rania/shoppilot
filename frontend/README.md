# ShopPilot 🚀

> **Dashboard e-commerce full-stack** — Go · React · PostgreSQL · Docker

ShopPilot est une application SaaS de gestion e-commerce avec tableau de bord en temps réel, gestion des stocks, suivi des commandes et génération de descriptions produits par IA (Claude).

---

## Stack technique

| Couche      | Technologie                                      |
|-------------|--------------------------------------------------|
| Backend     | Go 1.22, Gin, GORM, JWT (golang-jwt)             |
| Frontend    | React 18, Vite, Zustand, React Router v6         |
| Base de données | PostgreSQL 16                               |
| Infra       | Docker Compose, Redis                            |
| IA          | Anthropic Claude API (génération de descriptions)|
| Style       | CSS Variables custom (design system dark)        |

---

## Lancer l'application

### Prérequis
- Docker Desktop
- Node.js 18+

### 1. Backend + DB
```bash
# Copier l'env
cp .env.example .env

# Démarrer PostgreSQL + Redis + API Go
docker compose up -d

# Vérifier
curl http://localhost:8080/health
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 3. Accès démo
Cliquer sur **"Accès démo instantané"** sur la page de connexion.  
Le compte `demo@shoppilot.com` / `demo1234` est créé automatiquement avec 10 produits et 30 commandes de démo.

---

## Variables d'environnement

```env
# .env
DB_NAME=shoppilot
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=change-me-in-production
CLAUDE_API_KEY=sk-ant-...   # optionnel — active la génération IA
ENV=development
```

---

## Fonctionnalités

- 📊 **Dashboard** — KPIs temps réel, graphique revenus mensuels, répartition statuts
- 📦 **Produits** — CRUD complet, recherche, génération description par IA
- 🛒 **Commandes** — Liste avec filtres, changement statut inline
- 🚨 **Alertes stock** — Ruptures et stock faible avec barre de progression
- 🔐 **Auth JWT** — Register / Login sécurisé, session persistée
- 🐳 **Docker** — Un seul `docker compose up` pour tout démarrer

---

## Structure du projet

```
shoppilot/
├── api/                    # Backend Go
│   ├── cmd/main.go
│   ├── config/db.go
│   └── internal/
│       ├── handlers/       # auth, dashboard, products, orders
│       ├── middleware/      # JWT, logger
│       └── models/         # User, Product, Order, OrderItem
├── frontend/               # React + Vite
│   └── src/
│       ├── pages/          # Dashboard, Products, Orders, Alerts, Login
│       ├── components/     # Layout, Sidebar
│       ├── services/api.js # Axios + interceptors
│       └── store/authStore.js  # Zustand + persist
└── docker/
    └── docker-compose.yml
```