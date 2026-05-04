import { useEffect, useState, Fragment } from 'react'
import { ordersAPI } from '../services/api'
import { Search, ChevronDown, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUSES = ['completed', 'processing', 'pending', 'cancelled']

const STATUS_LABELS = {
  completed: 'Complétée',
  processing: 'En cours',
  pending: 'En attente',
  cancelled: 'Annulée',
}

const STATUS_CLASSES = {
  completed: 'badge-success',
  processing: 'badge-info',
  pending: 'badge-warning',
  cancelled: 'badge-danger',
}

// ───────── STATUS SELECT ─────────
function StatusSelect({ order, onChange }) {
  const [open, setOpen] = useState(false)

  const handleChange = async (status) => {
    setOpen(false)
    if (status === order.status) return

    try {
      await ordersAPI.updateStatus(order.id, status)
      toast.success('Statut mis à jour')
      onChange()
    } catch {
      toast.error('Erreur mise à jour')
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        className={`badge ${STATUS_CLASSES[order.status]}`}
        onClick={() => setOpen(!open)}
      >
        {STATUS_LABELS[order.status]}
        <ChevronDown size={10} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            background: '#111',
            border: '1px solid #333',
            padding: 6,
            borderRadius: 6,
            zIndex: 10,
          }}
        >
          {STATUSES.map((s) => (
            <div
              key={s}
              onClick={() => handleChange(s)}
              style={{ padding: 6, cursor: 'pointer' }}
            >
              {STATUS_LABELS[s]}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ───────── ROW COMPONENT (FIXED) ─────────
function OrderRow({ order, expanded, setExpanded, load }) {
  return (
    <>
      <tr>
        <td>#{order.order_number}</td>
        <td>{order.customer_name}</td>
        <td>{order.total.toFixed(2)} €</td>

        <td>
          <StatusSelect order={order} onChange={load} />
        </td>

        <td>
          <button onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
            <ChevronDown />
          </button>
        </td>
      </tr>

      {expanded === order.id && (
        <tr>
          <td colSpan={5}>
            <div style={{ padding: 10 }}>
              {order.items?.map((item) => (
                <div key={item.id}>
                  {item.name} × {item.quantity}
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ───────── PAGE ─────────
export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const res = await ordersAPI.list()
      setOrders(res.data || [])
    } catch {
      toast.error('Erreur chargement')
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const filtered = orders.filter((o) =>
    o.customer_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <h2>Commandes</h2>
      </div>

      <div className="search-bar">
        <Search size={14} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table>
          <tbody>
            {filtered.map((o) => (
              <OrderRow
                key={o.id}
                order={o}
                expanded={expanded}
                setExpanded={setExpanded}
                load={load}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}