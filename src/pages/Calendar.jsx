import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { dateKey } from '../lib/dateKey'

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
]
const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function CalendarPage({ data }) {
  const { progress, findExercise, findChallenge } = data
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [selected, setSelected] = useState(null)

  const doneDates = useMemo(
    () => new Set(progress.map((p) => p.date_completed)),
    [progress]
  )

  const grid = useMemo(() => buildMonthGrid(cursor), [cursor])
  const practiceDays = doneDates.size

  const selectedSessions = useMemo(() => {
    if (!selected) return []
    return progress
      .filter((p) => p.date_completed === selected)
      .map((p) => findExercise(p.exercise_id))
      .filter(Boolean)
  }, [selected, progress, findExercise])

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
        {grid.map((cell, i) => {
          if (!cell) return <div key={i} />
          const done = doneDates.has(cell.key)
          const classes = [
            'cal-cell',
            done ? 'done' : '',
            cell.isToday ? 'today' : '',
            cell.key === selected ? 'selected' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return done ? (
            <button
              key={i}
              className={classes}
              onClick={() => setSelected(cell.key === selected ? null : cell.key)}
              aria-pressed={cell.key === selected}
            >
              {cell.day}
            </button>
          ) : (
            <div key={i} className={classes}>
              {cell.day}
            </div>
          )
        })}
      </div>

      <p className="cal-summary">
        {practiceDays} jour{practiceDays > 1 ? 's' : ''} de pratique enregistré
        {practiceDays > 1 ? 's' : ''} au total.
      </p>

      {selected && (
        <div className="card cal-detail">
          <span className="eyebrow">{formatLongDate(selected)}</span>
          {selectedSessions.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--color-ink-faint)', marginTop: 8 }}>
              Séance validée ce jour-là (détail indisponible).
            </p>
          ) : (
            <ul className="cal-detail-list">
              {selectedSessions.map((ex) => (
                <li key={ex.id}>
                  <Link to={`/session/${ex.id}`} className="cal-detail-row">
                    <span className="cal-detail-title">{ex.titre}</span>
                    <span className="cal-detail-meta">
                      {findChallenge(ex.challenge_id)?.nom ?? ''}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

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
          border: none;
          font: inherit;
          width: 100%;
        }
        button.cal-cell { cursor: pointer; }
        .cal-cell.done { background: var(--color-primary); color: #fff; font-weight: 700; }
        .cal-cell.today { outline: 2px solid var(--color-accent-gold); outline-offset: -2px; }
        .cal-cell.selected { box-shadow: 0 0 0 2px var(--color-primary-dark); }
        .cal-summary { margin-top: 14px; font-size: 13px; color: var(--color-ink-faint); text-align: center; }
        .cal-detail { margin-top: 14px; padding: 16px; }
        .cal-detail-list { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
        .cal-detail-row {
          display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
          padding: 9px 6px; text-decoration: none; color: var(--color-ink);
          border-bottom: 1px solid var(--color-line);
        }
        .cal-detail-row:hover { background: var(--color-bg); }
        .cal-detail-title { font-size: 14px; font-weight: 500; }
        .cal-detail-meta { font-family: var(--font-mono); font-size: 11px; color: var(--color-ink-faint); text-align: right; flex-shrink: 0; }
      `}</style>
    </div>
  )
}

function shiftMonth(cursor, delta, setCursor) {
  const d = new Date(cursor)
  d.setMonth(d.getMonth() + delta)
  setCursor(d)
}

function formatLongDate(key) {
  const d = new Date(key + 'T00:00:00')
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function buildMonthGrid(cursor) {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // Lundi = 0
  const startOffset = (firstDay.getDay() + 6) % 7
  const todayK = dateKey()

  const cells = Array.from({ length: startOffset }, () => null)
  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(new Date(year, month, day))
    cells.push({ day, key, isToday: key === todayK })
  }
  return cells
}
