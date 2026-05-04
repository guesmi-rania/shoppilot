import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, ShoppingCart, Bell,
  LogOut, Zap, Settings,
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products',  icon: Package,         label: 'Produits' },
  { to: '/orders',    icon: ShoppingCart,    label: 'Commandes' },
  { to: '/alerts',    icon: Bell,            label: 'Alertes stock' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SP'

  return (
    <aside className="sidebar">
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">
            <Zap size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div className="logo-text">ShopPilot</div>
            <div className="logo-badge">Dashboard</div>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>

        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon size={16} />
            <span>{label}</span>
            {badge != null && <span className="nav-badge">{badge}</span>}
          </NavLink>
        ))}

        <div className="nav-section-label" style={{ marginTop: 24 }}>Compte</div>

        <div className="nav-item" onClick={() => navigate('/settings')}>
          <Settings size={16} />
          <span>Paramètres</span>
        </div>

        <div
          className="nav-item"
          onClick={handleLogout}
          style={{ color: 'var(--danger)' }}
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <div className="user-card">
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-name">{user?.name || 'Utilisateur'}</div>
            <div className="user-role">Admin</div>
          </div>
        </div>
      </div>
    </aside>
  )
}