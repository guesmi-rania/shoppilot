// src/components/Layout.jsx
import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import {
  LayoutDashboard, Package, ShoppingCart,
  AlertTriangle, Zap, LogOut, Menu, X,
} from 'lucide-react'

/* ── Liens de navigation ───────────────────────────── */
const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/products',  label: 'Produits',   icon: Package },
  { to: '/orders',    label: 'Commandes',  icon: ShoppingCart },
  { to: '/alerts',    label: 'Alertes',    icon: AlertTriangle, badge: true },
]

/* ── Composant NavItem partagé ─────────────────────── */
function SidebarNavItem({ item, onClick }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
    >
      <Icon />
      <span>{item.label}</span>
      {item.badge && <span className="nav-badge">!</span>}
    </NavLink>
  )
}

/* ═══════════════════════════════════════════════════════
   LAYOUT PRINCIPAL
════════════════════════════════════════════════════════ */
export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const user    = useAuthStore((s) => s.user)
  const logout  = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()

  /* Fermer la sidebar au changement de route */
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  /* Bloquer le scroll du body quand la sidebar est ouverte */
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  /* ── Libellé topbar selon la route ── */
  const PAGE_LABELS = {
    '/dashboard': { title: 'Dashboard',         sub: 'Vue d\'ensemble' },
    '/products':  { title: 'Produits',           sub: 'Gestion du catalogue' },
    '/orders':    { title: 'Commandes',           sub: 'Suivi des ventes' },
    '/alerts':    { title: 'Alertes Stock',       sub: 'Produits à réapprovisionner' },
  }
  const pageInfo = PAGE_LABELS[location.pathname] || { title: 'ShopPilot', sub: '' }

  return (
    <div className="app-shell">

      {/* ══════════════════════════════
          OVERLAY mobile (derrière la sidebar)
      ══════════════════════════════ */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ══════════════════════════════
          SIDEBAR
      ══════════════════════════════ */}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>

        {/* Bouton fermer (mobile) */}
        <button
          className="sidebar-close-btn"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fermer le menu"
        >
          <X size={14} />
        </button>

        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-mark">
            <div className="logo-icon">
              <Zap size={16} strokeWidth={2.5} />
            </div>
            <div>
              <div className="logo-text">ShopPilot</div>
              <div className="logo-badge">Pro Dashboard</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {NAV_ITEMS.map((item) => (
            <SidebarNavItem
              key={item.to}
              item={item}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* Footer utilisateur */}
        <div className="sidebar-footer">
          <div className="user-card" onClick={handleLogout} title="Se déconnecter">
            <div className="user-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="user-name truncate">{user?.name || 'Utilisateur'}</div>
              <div className="user-role">Se déconnecter</div>
            </div>
            <LogOut size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════
          CONTENU PRINCIPAL
      ══════════════════════════════ */}
      <div className="main-content">

        {/* ── Topbar ── */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            {/* Hamburger (visible uniquement mobile via CSS) */}
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={18} />
            </button>

            <div className="topbar-left">
              <h1>{pageInfo.title}</h1>
              {pageInfo.sub && <p>{pageInfo.sub}</p>}
            </div>
          </div>

          <div className="topbar-right">
            <div className="user-avatar" style={{ cursor: 'pointer' }} onClick={handleLogout} title="Se déconnecter">
              {initials}
            </div>
          </div>
        </header>

        {/* ── Page ── */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* ══════════════════════════════
          BOTTOM NAVIGATION (mobile)
      ══════════════════════════════ */}
      <nav className="bottom-nav" role="navigation" aria-label="Navigation mobile">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`bottom-nav-item${isActive ? ' active' : ''}`}
            >
              {item.badge && <span className="bottom-nav-badge">!</span>}
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

    </div>
  )
}