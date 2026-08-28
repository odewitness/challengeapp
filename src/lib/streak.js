import { dateKey } from './dateKey'

// Calcule la série de jours consécutifs avec au moins une séance complétée,
// en remontant depuis aujourd'hui (ou hier si rien fait aujourd'hui, pour ne
// pas casser la série tant que la journée n'est pas finie).
export function computeStreak(progress) {
  const days = new Set(progress.map((p) => p.date_completed))
  if (days.size === 0) return 0

  const cursor = new Date()
  let streak = 0

  if (!days.has(dateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(dateKey(cursor))) return 0
  }

  while (days.has(dateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

// Plus longue série jamais atteinte (sur tout l'historique), indépendante
// d'aujourd'hui.
export function computeBestStreak(progress) {
  const days = Array.from(new Set(progress.map((p) => p.date_completed))).sort()
  if (days.length === 0) return 0

  let best = 1
  let run = 1
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1] + 'T00:00:00')
    const curr = new Date(days[i] + 'T00:00:00')
    const diffDays = Math.round((curr - prev) / 86400000)
    run = diffDays === 1 ? run + 1 : 1
    if (run > best) best = run
  }
  return best
}
