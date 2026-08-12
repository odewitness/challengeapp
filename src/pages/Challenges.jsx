import { Link } from 'react-router-dom'
import BreathRing from '../components/BreathRing'

export default function Challenges({ data }) {
  const { challenges, activeChallengeIds, getChallengeStats, toggleChallengeActive, loading } = data

  if (loading) return <div className="page">Chargement…</div>

  const sorted = challenges.slice().sort((a, b) => a.ordre_affichage - b.ordre_affichage)

  return (
    <div className="page">
      <span className="eyebrow">Tous les challenges</span>
      <h1 style={{ fontSize: 24, marginBottom: 6 }}>Challenges</h1>
      <p style={{ fontSize: 13, color: 'var(--color-ink-faint)', marginBottom: 18 }}>
        Tu peux en suivre plusieurs en même temps — chacun garde sa propre progression.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {sorted.map((challenge) => {
          const stats = getChallengeStats(challenge.id)
          const isActive = activeChallengeIds.has(challenge.id)
          return (
            <div key={challenge.id} className="card challenge-card">
              <Link to={`/challenges/${challenge.id}`} className="challenge-card-main">
                <BreathRing pct={stats.pct} size={56} />
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 16 }}>{challenge.nom}</h2>
                  {challenge.description && (
                    <p style={{ fontSize: 12, color: 'var(--color-ink-faint)', marginTop: 2 }}>
                      {challenge.description}
                    </p>
                  )}
                  <p style={{ fontSize: 11, color: 'var(--color-ink-faint)', marginTop: 4 }}>
                    {stats.doneCount} / {stats.totalExercises} séances
                  </p>
                </div>
              </Link>
              <button
                className="btn btn-ghost"
                aria-pressed={isActive}
                onClick={() => toggleChallengeActive(challenge.id, !isActive)}
              >
                {isActive ? '✓ Suivi' : 'Suivre'}
              </button>
            </div>
          )
        })}
      </div>

      <style>{`
        .challenge-card { padding: 14px; display: flex; align-items: center; gap: 12px; }
        .challenge-card-main { flex: 1; display: flex; align-items: center; gap: 14px; text-decoration: none; color: var(--color-ink); min-width: 0; }
      `}</style>
    </div>
  )
}
