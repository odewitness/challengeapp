import { useParams, useNavigate } from 'react-router-dom'

export default function Session({ data }) {
  const { exerciseId } = useParams()
  const navigate = useNavigate()
  const { findExercise, findChallenge, completedIds, favoriteIds, toggleComplete, toggleFavorite } =
    data

  const ex = findExercise(exerciseId)
  if (!ex) return <div className="page">Séance introuvable.</div>

  const challenge = findChallenge(ex.challenge_id)

  const done = completedIds.has(ex.id)
  const fav = favoriteIds.has(ex.id)
  const materiels = (ex.materiel || '')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean)

  return (
    <div className="page session-page">
      <button className="back-btn" onClick={() => navigate(-1)} aria-label="Retour">
        ← Retour
      </button>

      <div className="video-wrap">
        <iframe
          src={`https://www.youtube.com/embed/${ex.video_id}`}
          title={ex.titre}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>

      <div className="session-meta">
        <span className="eyebrow">
          {challenge?.nom ?? ''} · Semaine {ex.semaine} · Jour {ex.jour}
        </span>
        <h1 style={{ fontSize: 22, marginTop: 4 }}>{ex.titre}</h1>

        <div className="tag-row">
          {ex.duree_min && <span className="tag">{ex.duree_min} min</span>}
          {ex.categorie && <span className="tag">{ex.categorie}</span>}
          {materiels.length === 0 && (
            <span className="tag" style={{ background: 'var(--color-bg)', color: 'var(--color-ink-faint)' }}>
              Aucun matériel
            </span>
          )}
          {materiels.map((m) => (
            <span key={m} className="tag tag-rose">
              🧘 {m}
            </span>
          ))}
        </div>

        {ex.texte && <p className="session-text">{ex.texte}</p>}
      </div>

      <div className="session-actions">
        <button
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={() => toggleComplete(ex.id, !done)}
        >
          {done ? '✓ Séance faite' : 'Marquer comme fait'}
        </button>
        <button
          className="btn btn-ghost"
          aria-pressed={fav}
          onClick={() => toggleFavorite(ex.id, !fav)}
          aria-label={fav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          {fav ? '♥' : '♡'}
        </button>
      </div>

      <style>{`
        .back-btn { border: none; background: none; padding: 4px 0 14px; font-weight: 600; color: var(--color-primary-dark); font-size: 14px; }
        .video-wrap { position: relative; width: 100%; padding-top: 56.25%; border-radius: var(--radius-m); overflow: hidden; background: #000; }
        .video-wrap iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
        .session-meta { margin-top: 18px; }
        .tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .session-text { margin-top: 16px; font-size: 14px; line-height: 1.6; color: var(--color-ink-soft); white-space: pre-line; }
        .session-actions { display: flex; gap: 10px; margin-top: 22px; }
      `}</style>
    </div>
  )
}
