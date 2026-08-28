import { useParams, useNavigate, Link } from 'react-router-dom'
import HoldTimer from '../components/HoldTimer'
import { useToast } from '../components/toastContext'
import VideoEmbed from '../components/VideoEmbed'

export default function Session({ data }) {
  const { exerciseId } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const {
    findExercise,
    findChallenge,
    getChallengeExercises,
    completedIds,
    favoriteIds,
    toggleComplete,
    toggleFavorite,
  } = data

  const ex = findExercise(exerciseId)
  if (!ex) return <div className="page">Séance introuvable.</div>

  const challenge = findChallenge(ex.challenge_id)

  // Séances du même jour, dans l'ordre, pour la navigation précédent/suivant.
  const sameDay = getChallengeExercises(ex.challenge_id).filter(
    (e) => e.semaine === ex.semaine && e.jour === ex.jour
  )
  const pos = sameDay.findIndex((e) => e.id === ex.id)
  const prev = pos > 0 ? sameDay[pos - 1] : null
  const next = pos >= 0 && pos < sameDay.length - 1 ? sameDay[pos + 1] : null

  const done = completedIds.has(ex.id)
  const fav = favoriteIds.has(ex.id)
  const materiels = (ex.materiel || '')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean)

  const handleToggleDone = () => {
    const nextDone = !done
    toggleComplete(ex.id, nextDone)
    if (nextDone) {
      showToast('Séance validée', {
        actionLabel: 'Annuler',
        onAction: () => toggleComplete(ex.id, false),
      })
    }
  }

  return (
    <div className="page session-page">
      <button className="back-btn" onClick={() => navigate(-1)} aria-label="Retour">
        ← Retour
      </button>

      <VideoEmbed source={ex.source} videoId={ex.video_id} title={ex.titre} />

      <div className="session-meta">
        <span className="eyebrow">
          {challenge?.nom ?? ''} · Semaine {ex.semaine} · Jour {ex.jour}
          {sameDay.length > 1 ? ` · ${pos + 1}/${sameDay.length}` : ''}
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
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleToggleDone}>
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

      <HoldTimer />

      {(prev || next) && (
        <div className="session-nav">
          {prev ? (
            <Link to={`/session/${prev.id}`} className="session-nav-link">
              ← {prev.titre}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={`/session/${next.id}`} className="session-nav-link right">
              {next.titre} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}

      <style>{`
        .session-meta { margin-top: 18px; }
        .tag-row { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .session-text { margin-top: 16px; font-size: 14px; line-height: 1.6; color: var(--color-ink-soft); white-space: pre-line; }
        .session-actions { display: flex; gap: 10px; margin-top: 22px; }
        .session-nav { display: flex; justify-content: space-between; gap: 12px; margin-top: 20px; }
        .session-nav-link {
          font-size: 12px; font-weight: 600; color: var(--color-primary-dark);
          text-decoration: none; max-width: 46%;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .session-nav-link.right { text-align: right; }
      `}</style>
    </div>
  )
}
