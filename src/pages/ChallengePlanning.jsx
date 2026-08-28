import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import BreathRing from '../components/BreathRing'
import DayCard from '../components/DayCard'

export default function ChallengePlanning({ data }) {
  const { challengeId } = useParams()
  const navigate = useNavigate()
  const {
    findChallenge,
    getChallengeWeeks,
    getChallengeStats,
    completedIds,
    activeChallengeIds,
    toggleChallengeActive,
    canEditChallenge,
    loading,
  } = data
  const [activeWeek, setActiveWeek] = useState(null)

  const challenge = findChallenge(challengeId)
  const weeks = getChallengeWeeks(challengeId)
  const stats = getChallengeStats(challengeId)
  const isActive = activeChallengeIds.has(challengeId)

  useEffect(() => {
    if (activeWeek === null && weeks.length) setActiveWeek(weeks[0].semaine)
  }, [weeks, activeWeek])

  if (loading) return <div className="page">Chargement…</div>
  if (!challenge) return <div className="page">Challenge introuvable.</div>
  if (!weeks.length) return <div className="page">Aucune séance dans ce challenge pour l'instant.</div>

  const currentWeek = weeks.find((w) => w.semaine === activeWeek) ?? weeks[0]

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/challenges')} aria-label="Retour">
        ← Tous les challenges
      </button>

      <header className="dash-header">
        <div>
          <span className="eyebrow">Planning complet</span>
          <h1 style={{ fontSize: 26 }}>{challenge.nom}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            <button
              className="btn btn-ghost"
              aria-pressed={isActive}
              onClick={() => toggleChallengeActive(challenge.id, !isActive)}
            >
              {isActive ? '✓ Suivi' : 'Suivre ce challenge'}
            </button>
            {canEditChallenge(challenge.id) && (
              <Link to={`/challenges/${challenge.id}/edit`} className="btn btn-ghost">
                Modifier
              </Link>
            )}
          </div>
        </div>
        <BreathRing pct={stats.pct} sublabel="complété" />
      </header>

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
