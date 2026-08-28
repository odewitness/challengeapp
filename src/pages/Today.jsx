import { Link } from 'react-router-dom'
import StreakBadge from '../components/StreakBadge'
import DayCard from '../components/DayCard'
import EquipmentCard from '../components/EquipmentCard'

export default function Today({ data }) {
  const { challenges, activeChallengeIds, streak, completedIds, getNextDayGroup, loading, error } =
    data

  if (loading) return <div className="page">Chargement…</div>
  if (error) return <div className="page">Une erreur est survenue : {error}</div>

  const activeChallenges = challenges.filter((c) => activeChallengeIds.has(c.id))

  return (
    <div className="page">
      <header className="today-header">
        <div>
          <span className="eyebrow">Aujourd'hui</span>
          <h1 style={{ fontSize: 26 }}>Tes séances</h1>
        </div>
        <StreakBadge streak={streak} />
      </header>

      {activeChallenges.length === 0 ? (
        <div className="card empty-state">
          <p style={{ fontWeight: 600, marginBottom: 6 }}>Aucun challenge suivi pour l'instant</p>
          <p style={{ fontSize: 13, color: 'var(--color-ink-faint)', marginBottom: 16 }}>
            Choisis un ou plusieurs challenges à suivre — tu peux en faire plusieurs en même
            temps, chacun garde sa propre progression.
          </p>
          <Link to="/challenges" className="btn btn-primary" style={{ display: 'inline-block' }}>
            Voir les challenges
          </Link>
        </div>
      ) : (
        <>
        <EquipmentCard activeChallenges={activeChallenges} data={data} />
        {activeChallenges.map((challenge) => {
          const nextDay = getNextDayGroup(challenge.id)
          return (
            <section key={challenge.id} style={{ marginBottom: 22 }}>
              <div className="today-challenge-head">
                <h2 style={{ fontSize: 16 }}>{challenge.nom}</h2>
                <Link to={`/challenges/${challenge.id}`} className="today-planning-link">
                  Planning complet →
                </Link>
              </div>

              {nextDay ? (
                <DayCard jour={nextDay.jour} exercises={nextDay.exercises} completedIds={completedIds} />
              ) : (
                <div className="card done-card">🎉 Challenge terminé — bravo !</div>
              )}
            </section>
          )
        })}
        </>
      )}

      <style>{`
        .today-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
        .empty-state { padding: 24px 20px; text-align: center; }
        .today-challenge-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 8px; }
        .today-planning-link { font-size: 12px; font-weight: 600; color: var(--color-primary-dark); text-decoration: none; }
        .done-card { padding: 20px; text-align: center; font-weight: 600; color: var(--color-primary-dark); }
      `}</style>
    </div>
  )
}
