// Clé de date "AAAA-MM-JJ" basée sur l'heure LOCALE de l'appareil.
//
// On n'utilise pas `new Date().toISOString().slice(0, 10)` : `toISOString()`
// renvoie la date en UTC. En France (UTC+1/+2), une séance validée en soirée
// (ex. 22 h 30) tombe déjà le lendemain en UTC → streak, calendrier et logique
// "terminé aujourd'hui" décalés d'un jour.
export function dateKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey() {
  return dateKey()
}
