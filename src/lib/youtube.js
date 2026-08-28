// Accepte un ID brut (11 caractères) ou une URL YouTube sous ses formes
// courantes et renvoie l'ID de la vidéo, ou '' si rien n'est reconnu.
//   dQw4w9WgXcQ
//   https://www.youtube.com/watch?v=dQw4w9WgXcQ
//   https://youtu.be/dQw4w9WgXcQ
//   https://www.youtube.com/embed/dQw4w9WgXcQ
//   https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?start=10
//   https://www.youtube.com/shorts/dQw4w9WgXcQ
export function parseVideoId(input) {
  const raw = (input || '').trim()
  if (!raw) return ''
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw

  try {
    const url = new URL(raw)
    const host = url.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      return url.pathname.slice(1, 12)
    }
    if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
      const v = url.searchParams.get('v')
      if (v) return v.slice(0, 11)
      const m = url.pathname.match(/\/(embed|shorts|v)\/([a-zA-Z0-9_-]{11})/)
      if (m) return m[2]
    }
  } catch {
    // pas une URL valide
  }
  return ''
}
