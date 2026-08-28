import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../components/toastContext'
import VideoEmbed from '../components/VideoEmbed'

// Charge (une seule fois) le script de l'API IFrame YouTube et signale quand
// window.YT.Player est disponible.
function useYouTubeApi() {
  const [ready, setReady] = useState(() => Boolean(window.YT && window.YT.Player))

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setReady(true)
      return
    }
    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      if (typeof previous === 'function') previous()
      setReady(true)
    }
    if (!document.getElementById('yt-iframe-api')) {
      const script = document.createElement('script')
      script.id = 'yt-iframe-api'
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    }
  }, [])

  return ready
}

export default function SessionPlaylist({ data }) {
  const { challengeId, semaine, jour } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()
  const { findChallenge, getChallengeWeeks, completedIds, toggleComplete, loading } = data

  const apiReady = useYouTubeApi()
  const mountRef = useRef(null)

  const challenge = findChallenge(challengeId)
  const weeks = getChallengeWeeks(challengeId)
  const day = weeks
    .find((w) => String(w.semaine) === String(semaine))
    ?.jours.find((j) => String(j.jour) === String(jour))
  const exercises = day?.exercises ?? []

  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)

  const current = exercises[index]
  const currentIsInstagram = current?.source === 'instagram'
  // Vidéo YouTube à charger (null si la séance courante est Instagram ou si on
  // a terminé) : sert de clé au (re)montage du lecteur.
  const currentYtId = !finished && current && !currentIsInstagram ? current.video_id : null

  const advance = () => {
    if (current && !completedIds.has(current.id)) toggleComplete(current.id, true)
    if (index + 1 < exercises.length) {
      setIndex(index + 1)
    } else {
      setFinished(true)
    }
  }

  const goTo = (i) => {
    if (i < 0 || i >= exercises.length) return
    setFinished(false)
    setIndex(i)
  }

  // Le lecteur YouTube est recréé à chaque séance YouTube (la nav interne ne
  // passe plus par loadVideoById pour gérer proprement les séances Instagram
  // intercalées). Les séances Instagram n'exposent aucun événement de fin :
  // l'utilisateur avance manuellement.
  useEffect(() => {
    if (!apiReady || !mountRef.current || !currentYtId) return
    const player = new window.YT.Player(mountRef.current, {
      videoId: currentYtId,
      host: 'https://www.youtube-nocookie.com',
      playerVars: { autoplay: 1, rel: 0, playsinline: 1, modestbranding: 1 },
      events: {
        onReady: (e) => e.target.playVideo(),
        onStateChange: (e) => {
          if (e.data === window.YT.PlayerState.ENDED) advance()
        },
      },
    })
    return () => player.destroy()
    // `index` garde le callback `advance` à jour ; `currentYtId` gère le
    // changement de vidéo et le passage depuis/vers une séance Instagram.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, currentYtId, index])

  if (loading) return <div className="page">Chargement…</div>
  if (!challenge) return <div className="page">Challenge introuvable.</div>
  if (!exercises.length) return <div className="page">Aucune séance pour ce jour.</div>

  const remaining = exercises.filter((e) => !completedIds.has(e.id))
  const isLast = index + 1 >= exercises.length

  const markCurrentDone = () => {
    if (current && !completedIds.has(current.id)) {
      toggleComplete(current.id, true)
      showToast('Séance validée', {
        actionLabel: 'Annuler',
        onAction: () => toggleComplete(current.id, false),
      })
    }
  }

  const markAllDone = () => {
    remaining.forEach((e) => toggleComplete(e.id, true))
    showToast(
      `${remaining.length} séance${remaining.length > 1 ? 's' : ''} validée${remaining.length > 1 ? 's' : ''}`
    )
  }

  return (
    <div className="page playlist-page">
      <button className="back-btn" onClick={() => navigate(-1)} aria-label="Retour">
        ← Retour
      </button>

      {finished ? (
        <div className="card done-card">🎉 Toutes les séances du jour sont terminées</div>
      ) : currentIsInstagram ? (
        <>
          <VideoEmbed source="instagram" videoId={current.video_id} title={current.titre} />
          <button className="btn btn-primary ig-advance" onClick={advance}>
            {isLast ? 'Marquer et terminer' : 'Marquer et passer à la suivante →'}
          </button>
        </>
      ) : (
        <div className="video-wrap" key={`yt-${index}`}>
          <div ref={mountRef} />
        </div>
      )}

      <div className="session-meta">
        <span className="eyebrow">
          {challenge.nom} · Semaine {semaine} · Jour {jour} · Enchaînement
        </span>
        <h1 style={{ fontSize: 22, marginTop: 4 }}>
          {finished ? 'Séances du jour terminées' : current.titre}
        </h1>
        <p className="playlist-progress">
          {finished ? `${exercises.length} / ${exercises.length}` : `${index + 1} / ${exercises.length}`} séance
          {exercises.length > 1 ? 's' : ''}
        </p>
      </div>

      {remaining.length > 0 && (
        <div className="playlist-actions">
          {!finished && current && !completedIds.has(current.id) && (
            <button className="btn btn-ghost" onClick={markCurrentDone}>
              Marquer cette séance comme faite
            </button>
          )}
          <button className="btn btn-ghost" onClick={markAllDone}>
            Tout marquer comme fait
          </button>
        </div>
      )}

      <ol className="playlist-list">
        {exercises.map((ex, i) => {
          const done = completedIds.has(ex.id)
          const isCurrent = i === index && !finished
          return (
            <li key={ex.id}>
              <button
                className={`playlist-row${isCurrent ? ' current' : ''}${done ? ' done' : ''}`}
                onClick={() => goTo(i)}
              >
                <span className="playlist-num" aria-hidden="true">
                  {done ? '✓' : i + 1}
                </span>
                <span className="playlist-title">
                  {ex.titre}
                  {ex.source === 'instagram' ? ' · Instagram' : ''}
                </span>
                <span className="playlist-time">{ex.duree_min ? `${ex.duree_min} min` : ''}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <style>{`
        .done-card { padding: 24px; text-align: center; font-weight: 600; color: var(--color-primary-dark); }
        .ig-advance { width: 100%; margin-top: 12px; }
        .session-meta { margin-top: 18px; }
        .playlist-progress { margin-top: 6px; font-family: var(--font-mono); font-size: 12px; color: var(--color-ink-faint); }
        .playlist-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
        .playlist-actions .btn { font-size: 13px; padding: 9px 14px; }
        .playlist-list { list-style: none; margin: 18px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
        .playlist-row {
          display: flex; align-items: center; gap: 10px; width: 100%;
          padding: 10px 8px; border: 1px solid transparent; border-radius: 10px;
          background: none; text-align: left; color: var(--color-ink); font: inherit;
        }
        .playlist-row:hover { background: var(--color-bg); }
        .playlist-row.current { border-color: var(--color-primary); background: var(--color-primary-tint); }
        .playlist-num {
          flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-mono); font-size: 11px; font-weight: 600;
          background: var(--color-bg); color: var(--color-ink-soft); border: 1px solid var(--color-line);
        }
        .playlist-row.done .playlist-num { background: var(--color-primary); color: #fff; border-color: var(--color-primary); }
        .playlist-title { flex: 1; font-size: 14px; font-weight: 500; }
        .playlist-row.done .playlist-title { color: var(--color-ink-faint); }
        .playlist-time { font-family: var(--font-mono); font-size: 11px; color: var(--color-ink-faint); }
      `}</style>
    </div>
  )
}
