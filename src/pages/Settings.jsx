import { useState } from 'react'
import { getReminderSettings, saveReminderSettings } from '../hooks/useDailyReminder'
import { useTheme } from '../lib/theme'

const THEME_OPTIONS = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'system', label: 'Auto' },
]

export default function SettingsPage({ auth }) {
  const { preference, setPreference } = useTheme()
  const [settings, setSettings] = useState(getReminderSettings())
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  )

  const enable = async () => {
    if (typeof Notification === 'undefined') return
    const perm = await Notification.requestPermission()
    setPermission(perm)
    if (perm === 'granted') {
      const next = { ...settings, enabled: true }
      setSettings(next)
      saveReminderSettings(next)
    }
  }

  const updateTime = (time) => {
    const next = { ...settings, time }
    setSettings(next)
    saveReminderSettings(next)
  }

  const disable = () => {
    const next = { ...settings, enabled: false }
    setSettings(next)
    saveReminderSettings(next)
  }

  return (
    <div className="page">
      <span className="eyebrow">Réglages</span>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Préférences</h1>

      <h2 style={{ fontSize: 15, marginBottom: 8 }}>Apparence</h2>
      <div className="card" style={{ padding: 18, marginBottom: 24 }}>
        <div className="seg" role="group" aria-label="Thème de l'application">
          {THEME_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={`seg-btn${preference === o.value ? ' active' : ''}`}
              aria-pressed={preference === o.value}
              onClick={() => setPreference(o.value)}
            >
              {o.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--color-ink-faint)', marginTop: 10 }}>
          « Auto » suit le thème clair ou sombre de ton appareil.
        </p>
      </div>

      <h2 style={{ fontSize: 15, marginBottom: 8 }}>Rappel quotidien</h2>
      <div className="card" style={{ padding: 18 }}>
        {permission === 'unsupported' && (
          <p style={{ fontSize: 13, color: 'var(--color-ink-faint)' }}>
            Les notifications ne sont pas prises en charge sur cet appareil/navigateur.
          </p>
        )}

        {permission !== 'unsupported' && (
          <>
            <p style={{ fontSize: 13, color: 'var(--color-ink-soft)', marginBottom: 12 }}>
              Reçois un rappel pour ta séance du jour. Fonctionne quand l'appli est
              installée et ouverte au moins une fois dans la journée.
            </p>

            {!settings.enabled ? (
              <button className="btn btn-primary" onClick={enable}>
                Activer les rappels
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>
                  Heure du rappel
                  <input
                    type="time"
                    value={settings.time}
                    onChange={(e) => updateTime(e.target.value)}
                    style={{
                      display: 'block',
                      marginTop: 6,
                      padding: '10px 12px',
                      border: '1px solid var(--color-line)',
                      borderRadius: 10,
                      fontSize: 14,
                    }}
                  />
                </label>
                <button className="btn btn-ghost" onClick={disable}>
                  Désactiver
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {!auth.isDemo && (
        <button className="btn btn-ghost" style={{ marginTop: 20, width: '100%' }} onClick={auth.signOut}>
          Se déconnecter
        </button>
      )}

      {auth.isDemo && (
        <p style={{ marginTop: 20, fontSize: 12, color: 'var(--color-ink-faint)', textAlign: 'center' }}>
          Mode démo — données stockées uniquement sur cet appareil.
        </p>
      )}

      <style>{`
        .seg { display: flex; gap: 4px; background: var(--color-bg); border-radius: 999px; padding: 4px; }
        .seg-btn {
          flex: 1; border: none; background: none; border-radius: 999px;
          padding: 8px 12px; font-size: 13px; font-weight: 600;
          color: var(--color-ink-soft);
        }
        .seg-btn.active { background: var(--color-primary); color: #fff; }
      `}</style>
    </div>
  )
}
