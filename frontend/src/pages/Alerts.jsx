import { useEffect, useState } from 'react'
import { productsAPI } from '../services/api'
import { AlertTriangle, Bell, Package, RefreshCw } from 'lucide-react'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  // ✅ FETCH DATA PROPRE
  const load = async () => {
    try {
      setLoading(true)
      const res = await productsAPI.lowStock()
      setAlerts(res.data || [])
    } catch (err) {
      console.error('Erreur load alerts:', err)
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // ✅ LOGIQUE CORRECTE
  const outOfStock = alerts.filter(p => p.stock === 0)
  const lowStock = alerts.filter(
    p => p.stock > 0 && p.stock <= p.low_stock
  )

  return (
    <div>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Alertes Stock</h2>
          <p className="page-subtitle">
            {alerts.length} produit(s) nécessitent votre attention
          </p>
        </div>

        <button className="btn btn-ghost" onClick={load}>
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid-2 mb-6">
        <div
          className="card"
          style={{
            '--accent-color': 'var(--danger)',
            '--icon-bg': 'rgba(239,68,68,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="stat-icon">
              <AlertTriangle size={20} />
            </div>

            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  lineHeight: 1,
                }}
              >
                {outOfStock.length}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  marginTop: 4,
                }}
              >
                En rupture de stock
              </div>
            </div>
          </div>
        </div>

        <div
          className="card"
          style={{
            '--accent-color': 'var(--warning)',
            '--icon-bg': 'rgba(245,158,11,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="stat-icon">
              <Bell size={20} />
            </div>

            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  lineHeight: 1,
                }}
              >
                {lowStock.length}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  marginTop: 4,
                }}
              >
                Stock faible
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Chargement…</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Package />
            <h3>Aucune alerte 🎉</h3>
            <p>Tous vos produits ont un stock suffisant</p>
          </div>
        </div>
      ) : (
        <>
          {/* OUT OF STOCK */}
          {outOfStock.length > 0 && (
            <div className="card mb-6">
              <div className="card-header">
                <div
                  className="card-title"
                  style={{ color: 'var(--danger)' }}
                >
                  🚨 Ruptures de stock ({outOfStock.length})
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {outOfStock.map(p => (
                  <AlertRow key={p.id} product={p} severity="danger" />
                ))}
              </div>
            </div>
          )}

          {/* LOW STOCK */}
          {lowStock.length > 0 && (
            <div className="card">
              <div className="card-header">
                <div
                  className="card-title"
                  style={{ color: 'var(--warning)' }}
                >
                  ⚠️ Stock faible ({lowStock.length})
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lowStock.map(p => (
                  <AlertRow key={p.id} product={p} severity="warning" />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ================= ROW ================= */
function AlertRow({ product: p, severity }) {
  const color =
    severity === 'danger' ? 'var(--danger)' : 'var(--warning)'

  const pct = Math.max(
    0,
    Math.min(100, (p.stock / (p.low_stock * 3)) * 100)
  )

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        background:
          severity === 'danger'
            ? 'rgba(239,68,68,0.05)'
            : 'rgba(245,158,11,0.05)',
        border: `1px solid ${
          severity === 'danger'
            ? 'rgba(239,68,68,0.15)'
            : 'rgba(245,158,11,0.15)'
        }`,
        borderRadius: 'var(--r-md)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
        <div className="product-thumb">📦</div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            {p.name}
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {p.category} · SKU: {p.sku || '—'} · Seuil: {p.low_stock}
          </div>

          <div
            style={{
              marginTop: 8,
              height: 4,
              background: 'var(--bg-elevated)',
              borderRadius: 2,
              width: 160,
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                background: color,
                borderRadius: 2,
                transition: '0.3s',
              }}
            />
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', marginLeft: 16 }}>
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            color,
            lineHeight: 1,
          }}
        >
          {p.stock}
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          en stock
        </div>
      </div>
    </div>
  )
}