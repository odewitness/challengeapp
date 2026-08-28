import { useEffect, useRef, useState } from 'react'

const PRESETS = [20, 30, 45, 60]

// Minuteur de maintien pour les étirements : on lance un compte à rebours,
// un bip + une vibration signalent la fin. Utile pour tenir une posture sans
// regarder l'écran.
export default function HoldTimer() {
  const [duration, setDuration] = useState(30)
  const [remaining, setRemaining] = useState(30)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current)
          setRunning(false)
          signalEnd()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running])

  const pickDuration = (d) => {
    setDuration(d)
    setRemaining(d)
    setRunning(false)
  }

  const toggle = () => {
    if (running) {
      setRunning(false)
      return
    }
    if (remaining === 0) setRemaining(duration)
    setRunning(true)
  }

  const reset = () => {
    setRunning(false)
    setRemaining(duration)
  }

  const mm = String(Math.floor(remaining / 60)).padStart(1, '0')
  const ss = String(remaining % 60).padStart(2, '0')

  return (
    <div className="card hold-timer">
      <div className="hold-timer-top">
        <span className="eyebrow">Minuteur de maintien</span>
        <div className="hold-presets">
          {PRESETS.map((d) => (
            <button
              key={d}
              className={`hold-preset${d === duration ? ' active' : ''}`}
              onClick={() => pickDuration(d)}
            >
              {d}s
            </button>
          ))}
        </div>
      </div>

      <div className="hold-time" aria-live="polite">
        {mm}:{ss}
      </div>

      <div className="hold-actions">
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={toggle}>
          {running ? 'Pause' : remaining === 0 ? 'Relancer' : 'Démarrer'}
        </button>
        <button className="btn btn-ghost" onClick={reset}>
          Réinitialiser
        </button>
      </div>

      <style>{`
        .hold-timer { padding: 16px; margin-top: 16px; }
        .hold-timer-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
        .hold-presets { display: flex; gap: 6px; }
        .hold-preset {
          border: 1px solid var(--color-line);
          background: var(--color-bg-raised);
          border-radius: 999px;
          padding: 5px 10px;
          font-size: 12px;
          font-weight: 600;
          color: var(--color-ink-soft);
        }
        .hold-preset.active { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }
        .hold-time {
          font-family: var(--font-mono);
          font-size: 44px;
          font-weight: 500;
          text-align: center;
          margin: 14px 0;
          color: var(--color-ink);
          font-variant-numeric: tabular-nums;
        }
        .hold-actions { display: flex; gap: 10px; }
      `}</style>
    </div>
  )
}

function signalEnd() {
  try {
    if (navigator.vibrate) navigator.vibrate([120, 60, 120])
  } catch {
    // ignore
  }
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 880
    osc.connect(gain)
    gain.connect(ctx.destination)
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6)
    osc.start()
    osc.stop(ctx.currentTime + 0.6)
    osc.onended = () => ctx.close()
  } catch {
    // ignore
  }
}
