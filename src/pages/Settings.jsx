import { useState } from 'react'
import { getReminderSettings, saveReminderSettings } from '../hooks/useDailyReminder'

export default function SettingsPage({ auth }) {
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
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Rappel quotidien</h1>

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
    </div>
  )
}
