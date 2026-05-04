import { useEffect, useState } from 'react'
import { dashboardAPI, ordersAPI, productsAPI } from '../services/api'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'
import {
  TrendingUp, Package, ShoppingCart, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Euro
} from 'lucide-react'

const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']

function buildRevenueData(orders) {
  const byMonth = {}
  ;(orders || []).forEach(o => {
    if (o.status !== 'completed') return
    const m = MONTHS[new Date(o.created_at).getMonth()]
    byMonth[m] = (byMonth[m] || 0) + o.total
  })
  return MONTHS.slice(0, new Date().getMonth() + 1).map(m => ({
    month: m,
    revenue: Math.round(byMonth[m] || 0),
  }))
}

function buildStatusData(orders) {
  const counts = { completed: 0, processing: 0, pending: 0, cancelled: 0 }
  ;(orders || []).forEach(o => { counts[o.status] = (counts[o.status] || 0) + 1 })
  return [
    { name: 'Complétées', value: counts.completed,  color: '#00e5a0' },
    { name: 'En cours',   value: counts.processing, color: '#3b82f6' },
    { name: 'En attente', value: counts.pending,     color: '#f59e0b' },
    { name: 'Annulées',   value: counts.cancelled,   color: '#ef4444' },
  ].filter(d => d.value > 0)
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--r-sm)',
        padding: '10px 14px',
        fontSize: 13,
      }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
        <p style={{ color: 'var(--accent)', fontWeight: 600 }}>
          {payload[0].value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
        </p>
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const [stats, setStats]     = useState(null)
  const [orders, setOrders]   = useState([])
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardAPI.getStats(),
      ordersAPI.list(),
      productsAPI.lowStock(),
    ]).then(([s, o, ls]) => {
      setStats(s.data)
      setOrders(o.data || [])
      setLowStock(ls.data || [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="loading-page" style={{ minHeight: 'unset', height: 400 }}>
      <div className="spinner" style={{ width: 32, height: 32 }} />
      <p>Chargement du dashboard…</p>
    </div>
  )

  const revenueData  = buildRevenueData(orders)
  const statusData   = buildStatusData(orders)
  const recentOrders = orders.slice(0, 5)

  const statCards = [
    {
      label: 'Revenus du mois',
      value: `${(stats?.monthly_revenue || 0).toLocaleString('fr-FR', { minimumFractionDigits: 0 })} €`,
      icon: Euro,
      color: '#00e5a0',
      bg: 'rgba(0,229,160,0.1)',
      change: '+12.4%',
      up: true,
    },
    {
      label: 'Commandes totales',
      value: stats?.total_orders || 0,
      icon: ShoppingCart,
      color: '#3b82f6',
      bg: 'rgba(59,130,246,0.1)',
      change: '+8.1%',
      up: true,
    },
    {
      label: 'Produits actifs',
      value: stats?.total_products || 0,
      icon: Package,
      color: '#a78bfa',
      bg: 'rgba(167,139,250,0.1)',
      change: '+3',
      up: true,
    },
    {
      label: 'Alertes stock',
      value: stats?.low_stock_count || 0,
      icon: AlertTriangle,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
      change: lowStock.length > 0 ? 'Action requise' : 'Tout OK',
      up: false,
    },
  ]

  const getStatusBadge = (status) => {
    const map = {
      completed:  'badge-success',
      processing: 'badge-info',
      pending:    'badge-warning',
      cancelled:  'badge-danger',
    }
    const labels = {
      completed: 'Complétée', processing: 'En cours',
      pending: 'En attente', cancelled: 'Annulée',
    }
    return <span className={`badge ${map[status] || 'badge-neutral'}`}>{labels[status] || status}</span>
  }

  return (
    <div>
      {/* STAT CARDS */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div
            key={i}
            className="stat-card"
            style={{ '--accent-color': s.color, '--icon-bg': s.bg }}
          >
            <div className="stat-icon">
              <s.icon size={20} />
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className={`stat-change ${s.up ? 'up' : ''}`}>
              {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {s.change} vs mois dernier
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS ROW */}
      <div className="grid-2 mb-6">
        {/* Revenue Chart */}
        <div className="card col-span-2" style={{ gridColumn: 'span 1' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Revenus mensuels</div>
              <div className="card-subtitle">Commandes complétées uniquement</div>
            </div>
            <TrendingUp size={18} color="var(--accent)" />
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#00e5a0" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#00e5a0" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#55556a', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#55556a', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}€`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#00e5a0" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Pie */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Statuts commandes</div>
              <div className="card-subtitle">Répartition globale</div>
            </div>
          </div>
          <div className="chart-container" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 8, fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {statusData.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                </div>
                <span style={{ fontWeight: 600 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div className="grid-2">
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Commandes récentes</div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Client</th>
                  <th>Total</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text-secondary)' }}>
                      #{o.order_number}
                    </td>
                    <td>{o.customer_name}</td>
                    <td style={{ fontWeight: 600 }}>{o.total.toFixed(2)} €</td>
                    <td>{getStatusBadge(o.status)}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 32 }}>Aucune commande</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Stock faible</div>
            {lowStock.length > 0 && (
              <span className="badge badge-warning">{lowStock.length} alertes</span>
            )}
          </div>
          {lowStock.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <Package size={40} />
              <h3>Tout est en stock !</h3>
              <p style={{ fontSize: 13 }}>Aucun produit en rupture</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {lowStock.slice(0, 6).map(p => (
                <div key={p.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--r-sm)',
                  border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="product-thumb">📦</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.category}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: p.stock === 0 ? 'var(--danger)' : 'var(--warning)' }}>
                      {p.stock}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>en stock</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}