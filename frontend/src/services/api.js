import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

// ── Attache le JWT à chaque requête ─────────────────────────────────────────
// On lit directement le localStorage (format Zustand persist)
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem('shoppilot-auth')
    if (raw) {
      const parsed = JSON.parse(raw)
      // Zustand persist wraps state under { state: { ... } }
      const token = parsed?.state?.token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
  } catch {
    // localStorage indisponible (SSR / private browsing strict)
  }
  return config
})

// ── Gestion des 401 ──────────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Nettoyer le store et rediriger
      try { localStorage.removeItem('shoppilot-auth') } catch {}
      // Éviter une boucle infinie si on est déjà sur /login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── AUTH ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats'),
}

// ── PRODUCTS ─────────────────────────────────────────────────────────────────
export const productsAPI = {
  list:                () => api.get('/api/products'),
  create:              (d)      => api.post('/api/products', d),
  update:              (id, d)  => api.put(`/api/products/${id}`, d),
  delete:              (id)     => api.delete(`/api/products/${id}`),
  lowStock:            ()       => api.get('/api/alerts/low-stock'),
  generateDescription: (id)     => api.post(`/api/products/${id}/generate-description`),
}

// ── ORDERS ───────────────────────────────────────────────────────────────────
export const ordersAPI = {
  list:         ()           => api.get('/api/orders'),
  updateStatus: (id, status) => api.put(`/api/orders/${id}/status`, { status }),
}

export default api