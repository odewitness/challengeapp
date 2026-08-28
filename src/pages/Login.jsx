import { useState } from 'react'

export default function Login({ auth }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'magic' | 'reset'
  const [notice, setNotice] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setNotice(null)
    if (mode === 'signin') return auth.signInWithPassword(email, password)
    if (mode === 'signup') return auth.signUp(email, password)
    if (mode === 'magic') {
      const { ok } = await auth.sendMagicLink(email)
      if (ok) setNotice('Lien de connexion envoyé — vérifie ta boîte mail.')
      return
    }
    if (mode === 'reset') {
      const { ok } = await auth.resetPassword(email)
      if (ok) setNotice('Email de réinitialisation envoyé.')
    }
  }

  const needsPassword = mode === 'signin' || mode === 'signup'
  const submitLabel = {
    signin: 'Se connecter',
    signup: 'Créer mon compte',
    magic: 'Recevoir un lien de connexion',
    reset: 'Réinitialiser le mot de passe',
  }[mode]

  return (
    <div className="page" style={{ paddingTop: 60 }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <span className="eyebrow">Bienvenue</span>
        <h1 style={{ fontSize: 26 }}>Mon Challenge</h1>
      </div>

      <form
        onSubmit={submit}
        className="card"
        style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}
      >
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

        {needsPassword && (
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
        )}

        {auth.error && <p style={{ color: 'var(--color-danger)', fontSize: 13 }}>{auth.error}</p>}
        {notice && <p style={{ color: 'var(--color-primary-dark)', fontSize: 13 }}>{notice}</p>}

        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>

        <div className="login-links">
          {mode !== 'signin' && (
            <button type="button" className="login-link" onClick={() => setMode('signin')}>
              Connexion par mot de passe
            </button>
          )}
          {mode !== 'signup' && (
            <button type="button" className="login-link" onClick={() => setMode('signup')}>
              Créer un compte
            </button>
          )}
          {mode !== 'magic' && (
            <button type="button" className="login-link" onClick={() => setMode('magic')}>
              Lien magique par email
            </button>
          )}
          {mode !== 'reset' && (
            <button type="button" className="login-link" onClick={() => setMode('reset')}>
              Mot de passe oublié ?
            </button>
          )}
        </div>
      </form>

      <style>{`
        .login-links { display: flex; flex-wrap: wrap; gap: 6px 16px; justify-content: center; margin-top: 4px; }
        .login-link {
          border: none; background: none; padding: 4px 0;
          font-size: 12px; font-weight: 600; color: var(--color-primary-dark);
          text-decoration: underline;
        }
      `}</style>
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
