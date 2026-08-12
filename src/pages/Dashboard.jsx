import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import BreathRing from '../components/BreathRing'
import StreakBadge from '../components/StreakBadge'
import DayCard from '../components/DayCard'

export default function Dashboard({ data }) {
  const { weeks, stats, streak, nextExercise, completedIds, loading, error } = data
  const [activeWeek, setActiveWeek] = useState(null)

  useEffect(() => {
    if (activeWeek === null && weeks.length) setActiveWeek(weeks[0].semaine)
  }, [weeks, activeWeek])

  if (loading) return <div className="page">Chargement…</div>
  if (error) return <div className="page">Une erreur est survenue : {error}</div>
  if (!weeks.length) return <div className="page">Aucune séance dans ce challenge pour l'instant.</div>

  const currentWeek = weeks.find((w) => w.semaine === activeWeek) ?? weeks[0]

  return (
    <div className="page">
      <header className="dash-header">
        <div>
          <span className="eyebrow">Ton challenge</span>
          <h1 style={{ fontSize: 26 }}>Marathon 4</h1>
          <div style={{ marginTop: 8 }}>
            <StreakBadge streak={streak} />
          </div>
        </div>
        <BreathRing pct={stats.pct} sublabel="complété" />
      </header>

      {nextExercise && (
        <Link to={`/session/${nextExercise.id}`} className="resume-card">
          <div>
            <span className="eyebrow" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Reprendre où j'en étais
            </span>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, marginTop: 2 }}>
              {nextExercise.titre}
            </p>
          </div>
          <span className="resume-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      )}

      <div className="week-tabs" role="tablist" aria-label="Semaines">
        {weeks.map((w) => (
          <button
            key={w.semaine}
            role="tab"
            aria-selected={w.semaine === currentWeek.semaine}
            className={`week-tab${w.semaine === currentWeek.semaine ? ' active' : ''}`}
            onClick={() => setActiveWeek(w.semaine)}
          >
            Semaine {w.semaine}
          </button>
        ))}
      </div>

      {currentWeek.jours.map((j) => (
        <DayCard key={j.jour} jour={j.jour} exercises={j.exercises} completedIds={completedIds} />
      ))}

      <style>{`
        .dash-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 18px; }
        .resume-card {
          display: flex; align-items: center; justify-content: space-between;
          background: var(--color-primary-dark);
          color: #fff;
          border-radius: var(--radius-m);
          padding: 16px 18px;
          text-decoration: none;
          margin-bottom: 20px;
        }
        .resume-arrow { font-size: 22px; }
        .week-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 14px; }
        .week-tab {
          flex-shrink: 0;
          border: 1px solid var(--color-line);
          background: var(--color-bg-raised);
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-ink-soft);
        }
        .week-tab.active { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }
      `}</style>
    </div>
  )
}
