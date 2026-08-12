import { supabase, isSupabaseConfigured } from './supabaseClient'
import { CHALLENGES, EXERCISES } from '../data/seedData'

const LS_PROGRESS = 'demo_progress' // [{ exercise_id, date_completed }]
const LS_FAVORITES = 'demo_favorites' // [exercise_id]

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function writeLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// ---------- Challenges & exercices ----------

export async function getChallenges() {
  if (!isSupabaseConfigured) return CHALLENGES
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .order('ordre_affichage', { ascending: true })
  if (error) throw error
  return data
}

export async function getExercises(challengeId) {
  if (!isSupabaseConfigured) {
    return EXERCISES.filter((e) => e.challenge_id === challengeId).sort(
      (a, b) => a.ordre - b.ordre
    )
  }
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('ordre', { ascending: true })
  if (error) throw error
  return data
}

// ---------- Progression ----------

export async function getProgress(userId) {
  if (!isSupabaseConfigured) {
    return readLS(LS_PROGRESS, [])
  }
  const { data, error } = await supabase
    .from('progress')
    .select('exercise_id, date_completed')
    .eq('user_id', userId)
  if (error) throw error
  return data
}

export async function setExerciseCompleted(userId, exerciseId, completed) {
  const today = new Date().toISOString().slice(0, 10)

  if (!isSupabaseConfigured) {
    const current = readLS(LS_PROGRESS, [])
    if (completed) {
      if (!current.find((p) => p.exercise_id === exerciseId)) {
        current.push({ exercise_id: exerciseId, date_completed: today })
      }
    } else {
      const idx = current.findIndex((p) => p.exercise_id === exerciseId)
      if (idx >= 0) current.splice(idx, 1)
    }
    writeLS(LS_PROGRESS, current)
    return current
  }

  if (completed) {
    const { error } = await supabase
      .from('progress')
      .upsert(
        { user_id: userId, exercise_id: exerciseId, date_completed: today },
        { onConflict: 'user_id,exercise_id' }
      )
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('progress')
      .delete()
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
    if (error) throw error
  }
  return getProgress(userId)
}

// ---------- Favoris ----------

export async function getFavorites(userId) {
  if (!isSupabaseConfigured) {
    return readLS(LS_FAVORITES, [])
  }
  const { data, error } = await supabase
    .from('favorites')
    .select('exercise_id')
    .eq('user_id', userId)
  if (error) throw error
  return data.map((f) => f.exercise_id)
}

export async function setFavorite(userId, exerciseId, isFavorite) {
  if (!isSupabaseConfigured) {
    const current = readLS(LS_FAVORITES, [])
    const next = isFavorite
      ? Array.from(new Set([...current, exerciseId]))
      : current.filter((id) => id !== exerciseId)
    writeLS(LS_FAVORITES, next)
    return next
  }
  if (isFavorite) {
    const { error } = await supabase
      .from('favorites')
      .upsert({ user_id: userId, exercise_id: exerciseId }, { onConflict: 'user_id,exercise_id' })
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('exercise_id', exerciseId)
    if (error) throw error
  }
  return getFavorites(userId)
}
