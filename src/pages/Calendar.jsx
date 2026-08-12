import { useMemo, useState } from 'react'

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]
const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function CalendarPage({ data }) {
  const { progress } = data
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })

  const doneDates = useMemo(
    () => new Set(progress.map((p) => p.date_completed)),
    [progress]
  )

  const grid = useMemo(() => buildMonthGrid(cursor), [cursor])
  const missedCount = useMemo(() => {
    const totalPracticeDays = doneDates.size
    return totalPracticeDays
  }, [doneDates])

  return (
    <div className="page">
      <span className="eyebrow">Calendrier</span>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Tes jours de pratique</h1>

      <div className="cal-nav">
        <button className="btn btn-ghost" onClick={() => shiftMonth(cursor, -1, setCursor)}>
          ←
        </button>
        <strong>
          {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
        </strong>
        <button className="btn btn-ghost" onClick={() => shiftMonth(cursor, 1, setCursor)}>
          →
        </button>
      </div>

      <div className="cal-grid card" style={{ padding: 14 }}>
        {DAY_LABELS.map((d, i) => (
          <div key={i} className="cal-daylabel">
            {d}
          </div>
        ))}
        {grid.map((cell, i) =>
          cell ? (
            <div
              key={i}
              className={`cal-cell${doneDates.has(cell.key) ? ' done' : ''}${
                cell.isToday ? ' today' : ''
              }`}
            >
              {cell.day}
            </div>
          ) : (
            <div key={i} />
          )
        )}
      </div>

      <p className="cal-summary">{missedCount} jour{missedCount > 1 ? 's' : ''} de pratique enregistré{missedCount > 1 ? 's' : ''} au total.</p>

      <style>{`
        .cal-nav { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 14px; font-family: var(--font-display); font-size: 16px; }
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
        .cal-daylabel { text-align: center; font-size: 11px; color: var(--color-ink-faint); font-weight: 700; padding-bottom: 4px; }
        .cal-cell {
          aspect-ratio: 1;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px;
          font-size: 13px;
          background: var(--color-bg);
          color: var(--color-ink-soft);
        }
        .cal-cell.done { background: var(--color-primary); color: #fff; font-weight: 700; }
        .cal-cell.today { outline: 2px solid var(--color-accent-gold); outline-offset: -2px; }
        .cal-summary { margin-top: 14px; font-size: 13px; color: var(--color-ink-faint); text-align: center; }
      `}</style>
    </div>
  )
}

function shiftMonth(cursor, delta, setCursor) {
  const d = new Date(cursor)
  d.setMonth(d.getMonth() + delta)
  setCursor(d)
}

function buildMonthGrid(cursor) {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // Lundi = 0
  const startOffset = (firstDay.getDay() + 6) % 7
  const todayKey = new Date().toISOString().slice(0, 10)

  const cells = Array.from({ length: startOffset }, () => null)
  for (let day = 1; day <= daysInMonth; day++) {
    const key = new Date(year, month, day).toISOString().slice(0, 10)
    cells.push({ day, key, isToday: key === todayKey })
  }
  return cells
}
