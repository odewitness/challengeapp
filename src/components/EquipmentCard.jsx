import { useMemo, useState } from 'react'

// Périodes proposées dans le select : chacune définit une fenêtre de jours à
// venir (offset = combien de jours on saute, count = combien on garde) à
// partir du jour courant de chaque challenge suivi.
const PERIODS = [
  { value: 'today', label: 'Le jour J', offset: 0, count: 1 },
  { value: 'tomorrow', label: 'Le lendemain', offset: 1, count: 1 },
  { value: 'week', label: 'La semaine', offset: 0, count: 7 },
]

export default function EquipmentCard({ activeChallenges, data }) {
  const { getUpcomingDayGroups } = data
  const [period, setPeriod] = useState('today')

  const config = PERIODS.find((p) => p.value === period) ?? PERIODS[0]

  const items = useMemo(() => {
    const map = new Map()
    for (const challenge of activeChallenges) {
      const groups = getUpcomingDayGroups(challenge.id, config.offset + config.count).slice(
        config.offset
      )
      for (const group of groups) {
        for (const ex of group.exercises) {
          const mats = (ex.materiel || '')
            .split(',')
            .map((m) => m.trim())
            .filter(Boolean)
          for (const m of mats) {
            const key = m.toLowerCase()
            if (!map.has(key)) {
              map.set(key, {
                label: m.charAt(0).toUpperCase() + m.slice(1),
                challenges: new Set(),
              })
            }
            map.get(key).challenges.add(challenge.nom)
          }
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'fr'))
  }, [activeChallenges, getUpcomingDayGroups, config])

  const multiChallenge = activeChallenges.length > 1

  return (
    <section className="card equipment-card">
      <div className="equipment-head">
        <div>
          <span className="eyebrow">À prévoir</span>
          <h2 style={{ fontSize: 16 }}>Matériel nécessaire</h2>
        </div>
        <select
          className="equipment-select"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          aria-label="Choisir la période"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {items.length === 0 ? (
        <p className="equipment-empty">Aucun matériel à prévoir sur cette période 🎉</p>
      ) : (
        <ul className="equipment-list">
          {items.map((item) => (
            <li key={item.label} className="equipment-item">
              <span className="equipment-name">🧘 {item.label}</span>
              {multiChallenge && (
                <span className="equipment-src">{Array.from(item.challenges).join(' · ')}</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <style>{`
        .equipment-card { padding: 16px; margin-bottom: 22px; }
        .equipment-head {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 12px; margin-bottom: 12px;
        }
        .equipment-select {
          flex-shrink: 0;
          border: 1px solid var(--color-line);
          background: var(--color-bg-raised);
          border-radius: 999px;
          padding: 7px 30px 7px 14px;
          font-size: 13px;
          font-weight: 600;
          font-family: var(--font-body);
          color: var(--color-primary-dark);
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%233f5a49' stroke-width='3'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
        }
        .equipment-empty { font-size: 13px; color: var(--color-ink-faint); }
        .equipment-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
        .equipment-item {
          display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
          padding: 9px 6px;
          border-bottom: 1px solid var(--color-line);
        }
        .equipment-item:last-child { border-bottom: none; }
        .equipment-name { font-size: 14px; font-weight: 500; }
        .equipment-src { font-family: var(--font-mono); font-size: 11px; color: var(--color-ink-faint); text-align: right; }
      `}</style>
    </section>
  )
}
