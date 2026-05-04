import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { Toaster } from 'react-hot-toast'

const pageTitles = {
  '/dashboard': { title: 'Dashboard',     subtitle: "Vue d'ensemble de votre activité" },
  '/products':  { title: 'Produits',      subtitle: 'Gérez votre catalogue produits' },
  '/orders':    { title: 'Commandes',     subtitle: 'Suivez et gérez vos commandes' },
  '/alerts':    { title: 'Alertes Stock', subtitle: 'Produits en rupture ou stock faible' },
}

export default function Layout() {
  const location = useLocation()
  const info = pageTitles[location.pathname] || { title: 'ShopPilot', subtitle: '' }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: 'var(--accent)', secondary: '#0a0a0f' } },
        }}
      />

      <div className="app-shell">
        <Sidebar />

        <div className="main-content">
          <header className="topbar">
            <div className="topbar-left">
              <h1>{info.title}</h1>
              {info.subtitle && <p>{info.subtitle}</p>}
            </div>
            <div className="topbar-right">
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-sm)',
                  padding: '4px 10px',
                }}
              >
                🟢 API connectée
              </div>
            </div>
          </header>

          {/* Outlet rend les pages enfants définies dans App.jsx */}
          <div className="page-content">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  )
}