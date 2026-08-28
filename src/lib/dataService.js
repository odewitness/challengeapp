import { supabase, isSupabaseConfigured } from './supabaseClient'
import { CHALLENGES, EXERCISES } from '../data/seedData'
import { todayKey } from './dateKey'

const LS_PROGRESS = 'demo_progress' // [{ exercise_id, date_completed }]
const LS_FAVORITES = 'demo_favorites' // [exercise_id]
const LS_ACTIVE_CHALLENGES = 'demo_active_challenges' // [challenge_id]
const LS_USER_CHALLENGES = 'demo_user_challenges' // challenges créés dans l'app
const LS_USER_EXERCISES = 'demo_user_exercises' // séances créées dans l'app

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

function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// Champs autorisés pour une séance, pour ne pas pousser de clés parasites en base.
const EXERCISE_FIELDS = [
  'semaine',
  'jour',
  'ordre',
  'titre',
  'video_id',
  'duree_min',
  'categorie',
  'materiel',
  'texte',
]

function pickExerciseFields(ex) {
  const out = {}
  for (const key of EXERCISE_FIELDS) if (ex[key] !== undefined) out[key] = ex[key]
  return out
}

// ---------- Challenges & exercices (lecture) ----------

export async function getChallenges() {
  if (!isSupabaseConfigured) {
    return [...CHALLENGES, ...readLS(LS_USER_CHALLENGES, [])].sort(
      (a, b) => (a.ordre_affichage ?? 0) - (b.ordre_affichage ?? 0)
    )
  }
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .order('ordre_affichage', { ascending: true })
  if (error) throw error
  return data
}

export async function getExercises(challengeId) {
  if (!isSupabaseConfigured) {
    return [...EXERCISES, ...readLS(LS_USER_EXERCISES, [])]
      .filter((e) => e.challenge_id === challengeId)
      .sort((a, b) => a.ordre - b.ordre)
  }
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('challenge_id', challengeId)
    .order('ordre', { ascending: true })
  if (error) throw error
  return data
}

// Récupère les exercices de TOUS les challenges en une fois (utile pour la
// page "Aujourd'hui" et pour retrouver un exercice par id sans connaître son
// challenge à l'avance).
export async function getAllExercises() {
  if (!isSupabaseConfigured) {
    return [...EXERCISES, ...readLS(LS_USER_EXERCISES, [])]
      .slice()
      .sort((a, b) => a.ordre - b.ordre)
  }
  const { data, error } = await supabase.from('exercises').select('*').order('ordre', { ascending: true })
  if (error) throw error
  return data
}

// ---------- Challenges & exercices (écriture) ----------
// Un utilisateur ne peut créer/modifier/supprimer que SES propres challenges
// (ceux avec un `owner_id`). Les challenges livrés avec l'app restent en
// lecture seule. En mode Supabase, c'est aussi verrouillé par les policies RLS.

export async function createChallenge(userId, { nom, description = '', ordre_affichage = 100 }) {
  const row = {
    id: genId(),
    nom: nom.trim(),
    description: description.trim(),
    ordre_affichage,
    owner_id: userId,
  }
  if (!isSupabaseConfigured) {
    const list = readLS(LS_USER_CHALLENGES, [])
    list.push(row)
    writeLS(LS_USER_CHALLENGES, list)
    return row
  }
  const { data, error } = await supabase.from('challenges').insert(row).select().single()
  if (error) throw error
  return data
}

export async function updateChallenge(userId, challengeId, patch) {
  const clean = {}
  for (const key of ['nom', 'description', 'ordre_affichage']) {
    if (patch[key] !== undefined) clean[key] = patch[key]
  }
  if (!isSupabaseConfigured) {
    const list = readLS(LS_USER_CHALLENGES, [])
    const idx = list.findIndex((c) => c.id === challengeId && c.owner_id === userId)
    if (idx < 0) throw new Error('Challenge non modifiable')
    list[idx] = { ...list[idx], ...clean }
    writeLS(LS_USER_CHALLENGES, list)
    return list[idx]
  }
  const { data, error } = await supabase
    .from('challenges')
    .update(clean)
    .eq('id', challengeId)
    .eq('owner_id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteChallenge(userId, challengeId) {
  if (!isSupabaseConfigured) {
    const challenges = readLS(LS_USER_CHALLENGES, []).filter(
      (c) => !(c.id === challengeId && c.owner_id === userId)
    )
    writeLS(LS_USER_CHALLENGES, challenges)
    const removedExerciseIds = new Set(
      readLS(LS_USER_EXERCISES, [])
        .filter((e) => e.challenge_id === challengeId)
        .map((e) => e.id)
    )
    writeLS(
      LS_USER_EXERCISES,
      readLS(LS_USER_EXERCISES, []).filter((e) => e.challenge_id !== challengeId)
    )
    writeLS(
      LS_PROGRESS,
      readLS(LS_PROGRESS, []).filter((p) => !removedExerciseIds.has(p.exercise_id))
    )
    writeLS(
      LS_FAVORITES,
      readLS(LS_FAVORITES, []).filter((id) => !removedExerciseIds.has(id))
    )
    writeLS(
      LS_ACTIVE_CHALLENGES,
      readLS(LS_ACTIVE_CHALLENGES, []).filter((id) => id !== challengeId)
    )
    return
  }
  // Les FK `on delete cascade` nettoient exercises / progress / favorites /
  // active_challenges côté Supabase.
  const { error } = await supabase
    .from('challenges')
    .delete()
    .eq('id', challengeId)
    .eq('owner_id', userId)
  if (error) throw error
}

// Crée (si pas d'`id`) ou met à jour une séance d'un challenge de l'utilisateur.
export async function saveExercise(userId, challengeId, exercise) {
  const fields = pickExerciseFields(exercise)
  fields.titre = (fields.titre || '').trim()
  fields.video_id = (fields.video_id || '').trim()

  if (!isSupabaseConfigured) {
    const list = readLS(LS_USER_EXERCISES, [])
    if (exercise.id) {
      const idx = list.findIndex((e) => e.id === exercise.id && e.owner_id === userId)
      if (idx < 0) throw new Error('Séance non modifiable')
      list[idx] = { ...list[idx], ...fields }
      writeLS(LS_USER_EXERCISES, list)
      return list[idx]
    }
    const maxOrdre = list
      .concat(EXERCISES)
      .filter((e) => e.challenge_id === challengeId)
      .reduce((m, e) => Math.max(m, e.ordre || 0), 0)
    const row = {
      id: genId(),
      challenge_id: challengeId,
      owner_id: userId,
      ordre: maxOrdre + 1,
      ...fields,
    }
    list.push(row)
    writeLS(LS_USER_EXERCISES, list)
    return row
  }

  if (exercise.id) {
    const { data, error } = await supabase
      .from('exercises')
      .update(fields)
      .eq('id', exercise.id)
      .eq('owner_id', userId)
      .select()
      .single()
    if (error) throw error
    return data
  }
  const { data: siblings, error: sErr } = await supabase
    .from('exercises')
    .select('ordre')
    .eq('challenge_id', challengeId)
    .order('ordre', { ascending: false })
    .limit(1)
  if (sErr) throw sErr
  const row = {
    id: genId(),
    challenge_id: challengeId,
    owner_id: userId,
    ordre: (siblings?.[0]?.ordre ?? 0) + 1,
    ...fields,
  }
  const { data, error } = await supabase.from('exercises').insert(row).select().single()
  if (error) throw error
  return data
}

export async function deleteExercise(userId, exerciseId) {
  if (!isSupabaseConfigured) {
    writeLS(
      LS_USER_EXERCISES,
      readLS(LS_USER_EXERCISES, []).filter(
        (e) => !(e.id === exerciseId && e.owner_id === userId)
      )
    )
    writeLS(
      LS_PROGRESS,
      readLS(LS_PROGRESS, []).filter((p) => p.exercise_id !== exerciseId)
    )
    writeLS(
      LS_FAVORITES,
      readLS(LS_FAVORITES, []).filter((id) => id !== exerciseId)
    )
    return
  }
  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', exerciseId)
    .eq('owner_id', userId)
  if (error) throw error
}

// Échange l'ordre de deux séances voisines du même jour ('up' / 'down').
export async function moveExercise(userId, challengeId, exerciseId, direction) {
  const all = await getExercises(challengeId)
  const target = all.find((e) => e.id === exerciseId)
  if (!target) return
  const sameDay = all
    .filter((e) => e.semaine === target.semaine && e.jour === target.jour)
    .sort((a, b) => a.ordre - b.ordre)
  const pos = sameDay.findIndex((e) => e.id === exerciseId)
  const swapWith = direction === 'up' ? sameDay[pos - 1] : sameDay[pos + 1]
  if (!swapWith) return

  const a = { id: target.id, ordre: swapWith.ordre }
  const b = { id: swapWith.id, ordre: target.ordre }

  if (!isSupabaseConfigured) {
    const list = readLS(LS_USER_EXERCISES, [])
    for (const upd of [a, b]) {
      const idx = list.findIndex((e) => e.id === upd.id && e.owner_id === userId)
      if (idx >= 0) list[idx] = { ...list[idx], ordre: upd.ordre }
    }
    writeLS(LS_USER_EXERCISES, list)
    return
  }
  for (const upd of [a, b]) {
    const { error } = await supabase
      .from('exercises')
      .update({ ordre: upd.ordre })
      .eq('id', upd.id)
      .eq('owner_id', userId)
    if (error) throw error
  }
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
  const today = todayKey()

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

// ---------- Challenges suivis (actifs) ----------
// L'utilisateur choisit quels challenges il suit en ce moment ; il peut en
// suivre plusieurs simultanément. Chacun garde sa propre progression.

export async function getActiveChallenges(userId) {
  if (!isSupabaseConfigured) {
    return readLS(LS_ACTIVE_CHALLENGES, [])
  }
  const { data, error } = await supabase
    .from('active_challenges')
    .select('challenge_id')
    .eq('user_id', userId)
  if (error) throw error
  return data.map((r) => r.challenge_id)
}

export async function setChallengeActive(userId, challengeId, active) {
  if (!isSupabaseConfigured) {
    const current = readLS(LS_ACTIVE_CHALLENGES, [])
    const next = active
      ? Array.from(new Set([...current, challengeId]))
      : current.filter((id) => id !== challengeId)
    writeLS(LS_ACTIVE_CHALLENGES, next)
    return next
  }
  if (active) {
    const { error } = await supabase
      .from('active_challenges')
      .upsert({ user_id: userId, challenge_id: challengeId }, { onConflict: 'user_id,challenge_id' })
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('active_challenges')
      .delete()
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
    if (error) throw error
  }
  return getActiveChallenges(userId)
}
