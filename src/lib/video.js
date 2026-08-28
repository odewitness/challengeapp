// Reconnaît une référence vidéo à partir d'un ID brut ou d'une URL, et sait
// construire l'URL d'embed correspondante. Deux sources gérées : YouTube et
// Instagram (Reels / posts publics).

// Renvoie { source, video_id } ou null si rien n'est reconnu.
//   YouTube  : dQw4w9WgXcQ | youtu.be/… | watch?v=… | /embed/… | /shorts/…
//   Instagram: instagram.com/reel/CODE/ | /p/CODE/ | /tv/CODE/
export function parseVideoRef(input) {
  const raw = (input || '').trim()
  if (!raw) return null

  // ID YouTube brut (11 caractères)
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) return { source: 'youtube', video_id: raw }

  let url
  try {
    url = new URL(raw)
  } catch {
    return null
  }
  const host = url.hostname.replace(/^www\./, '')

  if (host === 'youtu.be') {
    const id = url.pathname.slice(1, 12)
    return /^[a-zA-Z0-9_-]{11}$/.test(id) ? { source: 'youtube', video_id: id } : null
  }
  if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    const v = url.searchParams.get('v')
    if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return { source: 'youtube', video_id: v }
    const m = url.pathname.match(/\/(embed|shorts|v)\/([a-zA-Z0-9_-]{11})/)
    if (m) return { source: 'youtube', video_id: m[2] }
    return null
  }
  if (host === 'instagram.com' || host.endsWith('.instagram.com')) {
    const m = url.pathname.match(/\/(reel|reels|p|tv)\/([a-zA-Z0-9_-]+)/)
    if (m) return { source: 'instagram', video_id: m[2] }
    return null
  }
  return null
}

export function embedUrl({ source, video_id }) {
  if (source === 'instagram') {
    return `https://www.instagram.com/p/${video_id}/embed/`
  }
  return `https://www.youtube-nocookie.com/embed/${video_id}`
}

// URL "humaine" vers le contenu (utile pour pré-remplir un champ à l'édition).
export function watchUrl({ source, video_id }) {
  if (source === 'instagram') return `https://www.instagram.com/p/${video_id}/`
  return video_id
}

export const SOURCE_LABEL = { youtube: 'YouTube', instagram: 'Instagram' }
