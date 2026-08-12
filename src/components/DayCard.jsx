import { Link } from 'react-router-dom'

export default function DayCard({ jour, exercises, completedIds }) {
  const doneCount = exercises.filter((e) => completedIds.has(e.id)).length
  const allDone = doneCount === exercises.length

  return (
    <div className="card day-card">
      <div className="day-card-head">
        <div>
          <span className="eyebrow">Jour {jour}</span>
          <h3 style={{ fontSize: 18 }}>
            {exercises.length} séance{exercises.length > 1 ? 's' : ''}
          </h3>
        </div>
        <div className={`day-check${allDone ? ' done' : ''}`} aria-hidden="true">
          {allDone ? '✓' : `${doneCount}/${exercises.length}`}
        </div>
      </div>

      <ul className="day-card-list">
        {exercises.map((ex) => {
          const done = completedIds.has(ex.id)
          return (
            <li key={ex.id}>
              <Link to={`/session/${ex.id}`} className={`day-card-row${done ? ' done' : ''}`}>
                <span className={`dot${done ? ' done' : ''}`} aria-hidden="true" />
                <span className="row-title">{ex.titre}</span>
                <span className="row-meta">{ex.duree_min ? `${ex.duree_min} min` : ''}</span>
              </Link>
            </li>
          )
        })}
      </ul>

      <style>{`
        .day-card { padding: 16px; margin-bottom: 14px; }
        .day-card-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
        .day-check {
          font-family: var(--font-mono);
          font-size: 12px;
          font-weight: 600;
          color: var(--color-ink-soft);
          background: var(--color-bg);
          border: 1px solid var(--color-line);
          border-radius: 999px;
          padding: 4px 10px;
          min-width: 34px;
          text-align: center;
        }
        .day-check.done { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
        .day-card-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
        .day-card-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 6px;
          border-radius: 10px;
          text-decoration: none;
          color: var(--color-ink);
        }
        .day-card-row:hover { background: var(--color-bg); }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-line); flex-shrink: 0; }
        .dot.done { background: var(--color-primary); }
        .row-title { flex: 1; font-size: 14px; font-weight: 500; }
        .day-card-row.done .row-title { color: var(--color-ink-faint); text-decoration: line-through; }
        .row-meta { font-family: var(--font-mono); font-size: 11px; color: var(--color-ink-faint); }
      `}</style>
    </div>
  )
}
