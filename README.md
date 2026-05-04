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

## Bugs corrigés (v2)

### 🔴 Bug critique — Redirect login infinie
**Cause** : `useAuthStore` initialisait `isAuthenticated: null`, mais `PrivateRoute` testait `=== undefined`. Le test ne matchait jamais → redirect immédiate vers `/login`.

**Fix** :
```js
// AVANT (bug)
isAuthenticated: null
// ...
if (isAuthenticated === undefined) return null  // jamais true !

// APRÈS (corrigé)
isAuthenticated: false  // valeur par défaut claire
// PrivateRoute simplifié :
return isAuthenticated ? children : <Navigate to="/login" replace />
```

### 🔴 Bug — Session perdue au refresh
**Cause** : Zustand sans middleware `persist` → state réinitialisé à chaque reload.

**Fix** : Ajout de `persist` avec `localStorage` dans `authStore.js`.

### 🔴 Bug — Login avec token fake
**Cause** : `Login.jsx` appelait `login(user, 'demo-token')` sans appeler l'API → token invalide → 401 sur toutes les requêtes API → redirect `/login`.

**Fix** : Appel réel à `POST /api/auth/login` + gestion du compte démo via register si inexistant.

### 🟡 Bug — Routing imbriqué incorrect
**Cause** : `PrivateRoute` wrappait `<Layout />` sans structure Route parent correcte.

**Fix** : Refactoring avec route parent `path="/"` + routes enfants imbriquées + `PublicRoute` pour éviter d'accéder au login quand déjà connecté.

### 🟡 Bug — GenerateDescription placeholder
**Fix** : Intégration réelle de l'API Claude avec fallback si `CLAUDE_API_KEY` absent.

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
<img width="929" height="601" alt="7" src="https://github.com/user-attachments/assets/3baef40e-0117-43bc-b79d-029abbf1898a" />
