import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../components/toastContext'

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
  const playerRef = useRef(null)

  const challenge = findChallenge(challengeId)
  const weeks = getChallengeWeeks(challengeId)
  const day = weeks
    .find((w) => String(w.semaine) === String(semaine))
    ?.jours.find((j) => String(j.jour) === String(jour))
  const exercises = day?.exercises ?? []

  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)

  // Refs pour que le callback onStateChange (créé une fois) lise toujours la
  // valeur courante.
  const indexRef = useRef(0)
  const exercisesRef = useRef(exercises)
  const completeRef = useRef(null)
  indexRef.current = index
  exercisesRef.current = exercises
  completeRef.current = (id) => {
    if (!completedIds.has(id)) toggleComplete(id, true)
  }

  const goTo = (i) => {
    const list = exercisesRef.current
    if (i < 0 || i >= list.length) return
    setFinished(false)
    setIndex(i)
    if (playerRef.current) playerRef.current.loadVideoById(list[i].video_id)
  }

  const handleEnded = () => {
    const list = exercisesRef.current
    const current = list[indexRef.current]
    if (current) completeRef.current(current.id)
    const next = indexRef.current + 1
    if (next < list.length) {
      setIndex(next)
      if (playerRef.current) playerRef.current.loadVideoById(list[next].video_id)
    } else {
      setFinished(true)
    }
  }

  const firstVideoId = exercises[0]?.video_id

  useEffect(() => {
    if (!apiReady || !mountRef.current || !firstVideoId) return
    const player = new window.YT.Player(mountRef.current, {
      videoId: firstVideoId,
      host: 'https://www.youtube-nocookie.com',
      playerVars: { autoplay: 1, rel: 0, playsinline: 1, modestbranding: 1 },
      events: {
        onReady: (e) => e.target.playVideo(),
        onStateChange: (e) => {
          if (e.data === window.YT.PlayerState.ENDED) handleEnded()
        },
      },
    })
    playerRef.current = player
    return () => {
      player.destroy()
      playerRef.current = null
    }
    // On ne (re)crée le player que lorsque l'API devient prête ou que la
    // première vidéo du jour change ; la navigation interne passe par
    // loadVideoById.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiReady, firstVideoId])

  if (loading) return <div className="page">Chargement…</div>
  if (!challenge) return <div className="page">Challenge introuvable.</div>
  if (!exercises.length) return <div className="page">Aucune séance pour ce jour.</div>

  const current = exercises[index]
  const remaining = exercises.filter((e) => !completedIds.has(e.id))

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
    showToast(`${remaining.length} séance${remaining.length > 1 ? 's' : ''} validée${remaining.length > 1 ? 's' : ''}`)
  }

  return (
    <div className="page playlist-page">
      <button className="back-btn" onClick={() => navigate(-1)} aria-label="Retour">
        ← Retour
      </button>

      <div className="video-wrap">
        <div ref={mountRef} />
      </div>

      <div className="session-meta">
        <span className="eyebrow">
          {challenge.nom} · Semaine {semaine} · Jour {jour} · Lecture automatique
        </span>
        <h1 style={{ fontSize: 22, marginTop: 4 }}>
          {finished ? '🎉 Toutes les séances du jour sont terminées' : current.titre}
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
                <span className="playlist-title">{ex.titre}</span>
                <span className="playlist-time">{ex.duree_min ? `${ex.duree_min} min` : ''}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <style>{`
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
