import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authAPI } from '../services/api'
import { Zap, Mail, Lock, ArrowRight } from 'lucide-react'

export default function Login() {
  const login    = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  // ── Connexion réelle via l'API Go ────────────────────────────────────────
  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email et mot de passe requis')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await authAPI.login({ email, password })
      const { token, user } = res.data

      // Stocker dans Zustand (+ localStorage via persist)
      login(user, token)

      navigate('/dashboard', { replace: true })
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        'Email ou mot de passe incorrect'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // ── Inscription auto démo (crée le compte si inexistant) ─────────────────
  const handleDemo = async () => {
    setError('')
    setLoading(true)

    const demoEmail = 'demo@shoppilot.com'
    const demoPass  = 'demo1234'

    try {
      // Essaie de se connecter d'abord
      const res = await authAPI.login({ email: demoEmail, password: demoPass })
      login(res.data.user, res.data.token)
      navigate('/dashboard', { replace: true })
    } catch {
      // Si le compte n'existe pas encore, on le crée
      try {
        const res = await authAPI.register({
          name: 'Demo User',
          email: demoEmail,
          password: demoPass,
        })
        login(res.data.user, res.data.token)
        navigate('/dashboard', { replace: true })
      } catch (err2) {
        setError(err2.response?.data?.error || 'Erreur compte démo')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* Gradient orbs décoratifs */}
      <div
        style={{
          position: 'absolute', width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(0,229,160,0.07) 0%, transparent 70%)',
          bottom: -150, left: -150, pointerEvents: 'none',
        }}
      />

      <div className="login-card" style={{ width: 420 }}>

        {/* ── Logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
          <div className="logo-icon" style={{ width: 42, height: 42 }}>
            <Zap size={20} strokeWidth={2.5} />
          </div>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: 'var(--text-primary)',
            }}
          >
            ShopPilot
          </span>
        </div>

        <p className="login-subtitle" style={{ marginBottom: 28 }}>
          Connectez-vous à votre tableau de bord
        </p>

        {/* ── Erreur ── */}
        {error && (
          <div className="alert alert-danger" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* ── Formulaire ── */}
        <div className="login-form">

          {/* Email */}
          <div style={{ position: 'relative' }}>
            <Mail
              size={15}
              style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              className="login-input"
              type="email"
              placeholder="email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={{ paddingLeft: 40 }}
            />
          </div>

          {/* Mot de passe */}
          <div style={{ position: 'relative' }}>
            <Lock
              size={15}
              style={{
                position: 'absolute', left: 14, top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              className="login-input"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              style={{ paddingLeft: 40 }}
            />
          </div>

          {/* Bouton Se connecter */}
          <button
            className="btn btn-primary w-full"
            onClick={handleLogin}
            disabled={loading}
            style={{
              height: 46,
              fontSize: 15,
              fontWeight: 600,
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Connexion…
              </>
            ) : (
              <>
                Se connecter
                <ArrowRight size={16} />
              </>
            )}
          </button>

        </div>

        <div className="divider" style={{ margin: '20px 0' }} />

        {/* Bouton démo */}
        <button
          className="btn btn-ghost w-full"
          onClick={handleDemo}
          disabled={loading}
          style={{ height: 42, justifyContent: 'center', fontSize: 13 }}
        >
          ⚡ Accès démo instantané
        </button>

        <p style={{ fontSize: 11, textAlign: 'center', color: 'var(--text-muted)', marginTop: 12 }}>
          demo@shoppilot.com · demo1234
        </p>

      </div>
    </div>
  )
}