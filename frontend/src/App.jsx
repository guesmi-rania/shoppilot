import { Routes, Route, Navigate } from 'react-router-dom'

import Layout   from './components/Layout'
import Dashboard from './pages/Dashboard'
import Products  from './pages/Products'
import Orders    from './pages/Orders'
import Alerts    from './pages/Alerts'
import Login     from './pages/Login'

import { useAuthStore } from './store/authStore'

// ─── PrivateRoute ────────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// ─── PublicRoute ─────────────────────────────────────────────────────────────
function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* PROTECTED — Layout contient <Outlet /> pour les pages enfants */}
      
        {/* Redirection racine → dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products"  element={<Products />} />
        <Route path="orders"    element={<Orders />} />
        <Route path="alerts"    element={<Alerts />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}