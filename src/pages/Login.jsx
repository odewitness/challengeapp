import { useState } from 'react'

export default function Login({ auth }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'

  const submit = (e) => {
    e.preventDefault()
    if (mode === 'signin') auth.signInWithPassword(email, password)
    else auth.signUp(email, password)
  }

  return (
    <div className="page" style={{ paddingTop: 60 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <span className="eyebrow">Bienvenue</span>
        <h1 style={{ fontSize: 26 }}>Mon Challenge</h1>
      </div>

      <form onSubmit={submit} className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{ fontSize: 13, fontWeight: 600 }}>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </label>
        <label style={{ fontSize: 13, fontWeight: 600 }}>
          Mot de passe
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </label>
        {auth.error && (
          <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>{auth.error}</p>
        )}
        <button type="submit" className="btn btn-primary">
          {mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        >
          {mode === 'signin' ? 'Pas encore de compte ? Créer un compte' : "J'ai déjà un compte"}
        </button>
      </form>
    </div>
  )
}

const inputStyle = {
  display: 'block',
  width: '100%',
  marginTop: 6,
  padding: '10px 12px',
  border: '1px solid var(--color-line)',
  borderRadius: 10,
  fontSize: 14,
  fontFamily: 'var(--font-body)',
}
