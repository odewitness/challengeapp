import { Link } from 'react-router-dom'

export default function FavoritesPage({ data }) {
  const { exercises, favoriteIds, completedIds, findChallenge } = data
  const favs = exercises.filter((e) => favoriteIds.has(e.id))

  return (
    <div className="page">
      <span className="eyebrow">Épinglées</span>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Favoris</h1>

      {favs.length === 0 ? (
        <div className="card empty-state">
          <p>Aucune séance en favori pour l'instant.</p>
          <p style={{ color: 'var(--color-ink-faint)', fontSize: 13, marginTop: 6 }}>
            Ouvre une séance et appuie sur ♡ pour l'épingler ici — pratique pour les
            exercices que tu veux refaire souvent, hors planning.
          </p>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {favs.map((ex) => (
            <li key={ex.id}>
              <Link to={`/session/${ex.id}`} className="card fav-row">
                <div>
                  <span className="eyebrow">
                    {findChallenge(ex.challenge_id)?.nom ?? ''} · S{ex.semaine} · J{ex.jour}
                  </span>
                  <p style={{ fontWeight: 600, fontSize: 15 }}>{ex.titre}</p>
                </div>
                {completedIds.has(ex.id) && <span className="tag">Fait</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <style>{`
        .empty-state { padding: 24px 18px; text-align: center; }
        .fav-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; text-decoration: none; color: var(--color-ink); }
      `}</style>
    </div>
  )
}
