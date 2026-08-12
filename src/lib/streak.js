// Calcule la série de jours consécutifs avec au moins une séance complétée,
// en remontant depuis aujourd'hui (ou hier si rien fait aujourd'hui, pour ne
// pas casser la série tant que la journée n'est pas finie).
export function computeStreak(progress) {
  const days = new Set(progress.map((p) => p.date_completed))
  if (days.size === 0) return 0

  const toKey = (d) => d.toISOString().slice(0, 10)
  let cursor = new Date()
  let streak = 0

  if (!days.has(toKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(toKey(cursor))) return 0
  }

  while (days.has(toKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
