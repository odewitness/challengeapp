import { useMemo } from 'react'
import BreathRing from '../components/BreathRing'
import StreakBadge from '../components/StreakBadge'

export default function StatsPage({ data }) {
  const { exercises, completedIds, globalStats: stats, streak } = data

  const byCategory = useMemo(() => {
    const map = new Map()
    for (const ex of exercises) {
      if (!completedIds.has(ex.id)) continue
      const key = ex.categorie || 'Autre'
      map.set(key, (map.get(key) || 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [exercises, completedIds])

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
        </div>
      </div>

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
        .cat-row { display: flex; align-items: center; gap: 10px; font-size: 13px; margin-bottom: 10px; }
        .cat-row span:first-child { width: 100px; flex-shrink: 0; color: var(--color-ink-soft); }
        .cat-bar-track { flex: 1; height: 8px; background: var(--color-bg); border-radius: 999px; overflow: hidden; }
        .cat-bar-fill { height: 100%; background: var(--color-primary); border-radius: 999px; }
        .cat-count { font-family: var(--font-mono); font-size: 12px; width: 20px; text-align: right; }
      `}</style>
    </div>
  )
}
