import { useEffect, useState } from 'react'
import { productsAPI } from '../services/api'
import { Plus, Search, Pencil, Trash2, Package, Sparkles, X } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['Électronique', 'Mode', 'Maison', 'Beauté', 'Sport', 'Alimentaire', 'Autre']

const emptyForm = {
  name: '', description: '', price: '', stock: '',
  low_stock: 5, category: 'Autre', sku: '',
}

function ProductModal({ product, onClose, onSave }) {
  const [form, setForm]   = useState(product || emptyForm)
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAI = async () => {
    if (!product?.id) return
    setAiLoading(true)
    try {
      const r = await productsAPI.generateDescription(product.id)
      set('description', r.data.description)
      toast.success('Description générée par IA !')
    } catch {
      toast.error('Erreur IA')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price) return toast.error('Nom et prix requis')
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        low_stock: parseInt(form.low_stock) || 5,
      }
      if (product?.id) {
        await productsAPI.update(product.id, payload)
        toast.success('Produit mis à jour')
      } else {
        await productsAPI.create(payload)
        toast.success('Produit créé !')
      }
      onSave()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h2 className="modal-title">{product?.id ? 'Modifier le produit' : 'Nouveau produit'}</h2>
          <button className="modal-close" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="grid-2">
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Nom du produit *</label>
            <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ex: Casque Bluetooth Pro" />
          </div>

          <div className="form-group">
            <label className="form-label">Prix (€) *</label>
            <input className="form-input" type="number" step="0.01" value={form.price} onChange={e => set('price', e.target.value)} placeholder="29.99" />
          </div>

          <div className="form-group">
            <label className="form-label">SKU</label>
            <input className="form-input" value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="SKU-0001" />
          </div>

          <div className="form-group">
            <label className="form-label">Stock actuel</label>
            <input className="form-input" type="number" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="0" />
          </div>

          <div className="form-group">
            <label className="form-label">Seuil alerte stock</label>
            <input className="form-input" type="number" value={form.low_stock} onChange={e => set('low_stock', e.target.value)} placeholder="5" />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Catégorie</label>
            <select className="form-input" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label className="form-label" style={{ margin: 0 }}>Description</label>
              {product?.id && (
                <button className="btn btn-ghost btn-sm" onClick={handleAI} disabled={aiLoading}>
                  <Sparkles size={12} />
                  {aiLoading ? 'Génération…' : 'IA'}
                </button>
              )}
            </div>
            <textarea className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description du produit…" />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Enregistrement…' : product?.id ? 'Mettre à jour' : 'Créer le produit'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Products() {
  const [products, setProducts] = useState([])
  const [search,   setSearch]   = useState('')
  const [modal,    setModal]    = useState(null)   // null | 'new' | product object
  const [loading,  setLoading]  = useState(true)
  const [deleting, setDeleting] = useState(null)

  const load = () => {
    setLoading(true)
    productsAPI.list().then(r => setProducts(r.data || [])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (p) => {
    if (!confirm(`Supprimer "${p.name}" ?`)) return
    setDeleting(p.id)
    try {
      await productsAPI.delete(p.id)
      toast.success('Produit supprimé')
      load()
    } catch {
      toast.error('Erreur suppression')
    } finally {
      setDeleting(null)
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  )

  const getStockBadge = (p) => {
    if (p.stock === 0) return <span className="badge badge-danger">Rupture</span>
    if (p.stock <= p.low_stock) return <span className="badge badge-warning">Stock faible</span>
    return <span className="badge badge-success">En stock</span>
  }

  return (
    <div>
      {modal && (
        <ProductModal
          product={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load() }}
        />
      )}

      <div className="page-header">
        <div>
          <h2 className="page-title">Catalogue produits</h2>
          <p className="page-subtitle">{products.length} produits au total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('new')}>
          <Plus size={16} /> Nouveau produit
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: 20 }}>
          <div className="search-bar">
            <Search size={15} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par nom, catégorie, SKU…"
            />
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            Chargement…
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Package />
            <h3>Aucun produit trouvé</h3>
            <p>Ajoutez votre premier produit ou modifiez la recherche</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>SKU</th>
                  <th>Catégorie</th>
                  <th>Prix</th>
                  <th>Stock</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="product-thumb">📦</div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{p.name}</div>
                          {p.description && (
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: 200 }} className="truncate">
                              {p.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{p.sku || '—'}</td>
                    <td>
                      <span style={{
                        fontSize: 12, padding: '3px 8px',
                        background: 'var(--bg-elevated)',
                        borderRadius: 4,
                        color: 'var(--text-secondary)',
                      }}>{p.category}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{parseFloat(p.price).toFixed(2)} €</td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 16,
                        fontWeight: 700,
                        color: p.stock === 0 ? 'var(--danger)' : p.stock <= p.low_stock ? 'var(--warning)' : 'var(--text-primary)',
                      }}>{p.stock}</span>
                    </td>
                    <td>{getStockBadge(p)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal(p)} title="Modifier">
                          <Pencil size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(p)}
                          disabled={deleting === p.id}
                          title="Supprimer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}