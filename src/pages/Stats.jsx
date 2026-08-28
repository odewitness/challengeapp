import { useMemo } from 'react'
import BreathRing from '../components/BreathRing'
import StreakBadge from '../components/StreakBadge'
import { dateKey } from '../lib/dateKey'

export default function StatsPage({ data }) {
  const { exercises, completedIds, globalStats: stats, streak, bestStreak, progress } = data

  const byCategory = useMemo(() => {
    const map = new Map()
    for (const ex of exercises) {
      if (!completedIds.has(ex.id)) continue
      const key = ex.categorie || 'Autre'
      map.set(key, (map.get(key) || 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [exercises, completedIds])

  // Jours de pratique par semaine sur les 8 dernières semaines (lundi → dimanche).
  const weeklyBars = useMemo(() => {
    const doneDays = new Set(progress.map((p) => p.date_completed))
    const weeks = []
    const monday = new Date()
    monday.setHours(0, 0, 0, 0)
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
    for (let w = 7; w >= 0; w--) {
      const start = new Date(monday)
      start.setDate(start.getDate() - w * 7)
      let count = 0
      for (let d = 0; d < 7; d++) {
        const day = new Date(start)
        day.setDate(day.getDate() + d)
        if (doneDays.has(dateKey(day))) count++
      }
      weeks.push({ label: `${start.getDate()}/${start.getMonth() + 1}`, count })
    }
    return weeks
  }, [progress])

  const hasWeeklyData = weeklyBars.some((w) => w.count > 0)
  const hours = Math.floor(stats.totalMinutesDone / 60)
  const mins = stats.totalMinutesDone % 60

  return (
    <div className="page">
      <span className="eyebrow">Tes statistiques</span>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Progression</h1>

      <div className="stats-top card">
        <BreathRing pct={stats.pct} size={110} sublabel="du challenge" />
        <div className="stats-top-right">
          <StreakBadge streak={streak} />
          <p className="stats-figure">
            {stats.doneCount}
            <span> / {stats.totalExercises} séances faites</span>
          </p>
          <p className="stats-figure">
            {hours > 0 ? `${hours}h${mins.toString().padStart(2, '0')}` : `${mins} min`}
            <span> de pratique cumulée</span>
          </p>
          <p className="stats-figure">
            {bestStreak} jour{bestStreak > 1 ? 's' : ''}
            <span> meilleure série</span>
          </p>
        </div>
      </div>

      {hasWeeklyData && (
        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>8 dernières semaines</h3>
          <div className="week-bars">
            {weeklyBars.map((w, i) => (
              <div key={i} className="week-bar-col">
                <div className="week-bar-track">
                  <div
                    className="week-bar-fill"
                    style={{ height: `${(w.count / 7) * 100}%` }}
                    title={`${w.count} jour${w.count > 1 ? 's' : ''}`}
                  />
                </div>
                <span className="week-bar-count">{w.count}</span>
                <span className="week-bar-label">{w.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {byCategory.length > 0 && (
        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>Répartition par catégorie</h3>
          {byCategory.map(([cat, count]) => (
            <div key={cat} className="cat-row">
              <span>{cat}</span>
              <div className="cat-bar-track">
                <div
                  className="cat-bar-fill"
                  style={{ width: `${(count / stats.doneCount) * 100}%` }}
                />
              </div>
              <span className="cat-count">{count}</span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .stats-top { display: flex; align-items: center; gap: 18px; padding: 18px; }
        .stats-top-right { display: flex; flex-direction: column; gap: 8px; }
        .stats-figure { font-family: var(--font-display); font-size: 20px; font-weight: 600; }
        .stats-figure span { display: block; font-family: var(--font-body); font-size: 12px; font-weight: 400; color: var(--color-ink-faint); }
        .week-bars { display: flex; align-items: flex-end; justify-content: space-between; gap: 6px; }
        .week-bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .week-bar-track { width: 100%; height: 80px; background: var(--color-bg); border-radius: 6px; display: flex; align-items: flex-end; overflow: hidden; }
        .week-bar-fill { width: 100%; background: var(--color-primary); border-radius: 6px 6px 0 0; min-height: 2px; transition: height 0.4s ease; }
        .week-bar-count { font-family: var(--font-mono); font-size: 11px; color: var(--color-ink-soft); }
        .week-bar-label { font-size: 9px; color: var(--color-ink-faint); }
        .cat-row { display: flex; align-items: center; gap: 10px; font-size: 13px; margin-bottom: 10px; }
        .cat-row span:first-child { width: 100px; flex-shrink: 0; color: var(--color-ink-soft); }
        .cat-bar-track { flex: 1; height: 8px; background: var(--color-bg); border-radius: 999px; overflow: hidden; }
        .cat-bar-fill { height: 100%; background: var(--color-primary); border-radius: 999px; }
        .cat-count { font-family: var(--font-mono); font-size: 12px; width: 20px; text-align: right; }
      `}</style>
    </div>
  )
}
