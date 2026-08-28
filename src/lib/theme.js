import { useSyncExternalStore } from 'react'

// Préférence de thème : 'light' | 'dark' | 'system'.
// - 'system' (défaut) : pas d'attribut, le CSS suit `prefers-color-scheme`
// - 'light' / 'dark'   : `data-theme` posé sur <html>, force le thème
// Le pré-rendu (script inline dans index.html) applique déjà le choix stocké
// avant le premier paint ; ce module gère les changements à chaud + la synchro
// entre composants.

const LS_KEY = 'theme'
const THEME_COLORS = { light: '#F1F3ED', dark: '#141815' }

const listeners = new Set()
const mql =
  typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null

export function getPreference() {
  try {
    const v = localStorage.getItem(LS_KEY)
    return v === 'light' || v === 'dark' ? v : 'system'
  } catch {
    return 'system'
  }
}

export function resolveTheme(preference = getPreference()) {
  if (preference === 'light' || preference === 'dark') return preference
  return mql && mql.matches ? 'dark' : 'light'
}

function apply(preference) {
  const root = document.documentElement
  if (preference === 'light' || preference === 'dark') {
    root.setAttribute('data-theme', preference)
  } else {
    root.removeAttribute('data-theme')
  }
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', THEME_COLORS[resolveTheme(preference)])
}

export function setPreference(preference) {
  try {
    if (preference === 'system') localStorage.removeItem(LS_KEY)
    else localStorage.setItem(LS_KEY, preference)
  } catch {
    // stockage indisponible : on applique quand même pour la session
  }
  apply(preference)
  listeners.forEach((l) => l())
}

// Quand le thème système change et qu'on est en mode 'system', on répercute.
if (mql) {
  mql.addEventListener('change', () => {
    if (getPreference() === 'system') {
      apply('system')
      listeners.forEach((l) => l())
    }
  })
}

function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useTheme() {
  const preference = useSyncExternalStore(subscribe, getPreference, () => 'system')
  return { preference, resolved: resolveTheme(preference), setPreference }
}
