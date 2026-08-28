import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getChallenges,
  getAllExercises,
  getProgress,
  setExerciseCompleted,
  getFavorites,
  setFavorite,
  getActiveChallenges,
  setChallengeActive,
} from '../lib/dataService'
import { computeStreak } from '../lib/streak'

export function useChallenges(userId) {
  const [challenges, setChallenges] = useState([])
  const [exercises, setExercises] = useState([])
  const [progress, setProgress] = useState([])
  const [favorites, setFavorites] = useState([])
  const [activeChallengeIds, setActiveChallengeIds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [chs, ex, prog, favs, active] = await Promise.all([
          getChallenges(),
          getAllExercises(),
          getProgress(userId),
          getFavorites(userId),
          getActiveChallenges(userId),
        ])
        if (cancelled) return
        setChallenges(chs)
        setExercises(ex)
        setProgress(prog)
        setFavorites(favs)
        setActiveChallengeIds(active)
      } catch (e) {
        setError(e.message ?? String(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const completedIds = useMemo(() => new Set(progress.map((p) => p.exercise_id)), [progress])
  const completedDates = useMemo(
    () => new Map(progress.map((p) => [p.exercise_id, p.date_completed])),
    [progress]
  )
  const favoriteIds = useMemo(() => new Set(favorites), [favorites])

  // Si l'utilisateur n'a encore explicitement "suivi" aucun challenge (cas des
  // comptes créés avant cette fonctionnalité), on considère automatiquement
  // comme actif tout challenge où il a déjà de la progression — pour ne pas
  // faire disparaître Marathon 4 du jour au lendemain.
  const effectiveActiveIds = useMemo(() => {
    if (activeChallengeIds.length > 0) return new Set(activeChallengeIds)
    const inferred = new Set()
    for (const ex of exercises) {
      if (completedIds.has(ex.id)) inferred.add(ex.challenge_id)
    }
    return inferred
  }, [activeChallengeIds, exercises, completedIds])

  const exercisesByChallenge = useMemo(() => {
    const map = new Map()
    for (const ex of exercises) {
      if (!map.has(ex.challenge_id)) map.set(ex.challenge_id, [])
      map.get(ex.challenge_id).push(ex)
    }
    for (const list of map.values()) list.sort((a, b) => a.ordre - b.ordre)
    return map
  }, [exercises])

  const getChallengeExercises = useCallback(
    (challengeId) => exercisesByChallenge.get(challengeId) ?? [],
    [exercisesByChallenge]
  )

  const getChallengeWeeks = useCallback(
    (challengeId) => {
      const exs = getChallengeExercises(challengeId)
      const byWeek = new Map()
      for (const ex of exs) {
        if (!byWeek.has(ex.semaine)) byWeek.set(ex.semaine, new Map())
        const byDay = byWeek.get(ex.semaine)
        if (!byDay.has(ex.jour)) byDay.set(ex.jour, [])
        byDay.get(ex.jour).push(ex)
      }
      return Array.from(byWeek.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([semaine, byDay]) => ({
          semaine,
          jours: Array.from(byDay.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([jour, items]) => ({
              jour,
              exercises: items.sort((a, b) => a.ordre - b.ordre),
              done: items.every((ex) => completedIds.has(ex.id)),
            })),
        }))
    },
    [getChallengeExercises, completedIds]
  )

  const getChallengeStats = useCallback(
    (challengeId) => {
      const exs = getChallengeExercises(challengeId)
      const totalExercises = exs.length
      const doneCount = exs.filter((e) => completedIds.has(e.id)).length
      const totalMinutesDone = exs
        .filter((e) => completedIds.has(e.id))
        .reduce((sum, e) => sum + (e.duree_min || 0), 0)
      const pct = totalExercises ? Math.round((doneCount / totalExercises) * 100) : 0
      return { totalExercises, doneCount, totalMinutesDone, pct }
    },
    [getChallengeExercises, completedIds]
  )

  // Le prochain "jour" (groupe d'exercices) à proposer sur la page
  // "Aujourd'hui" : le premier jour non entièrement complété, dans l'ordre du
  // challenge — sauf si ce jour a été entamé (au moins une vidéo faite) un
  // jour calendaire précédent sans être terminé, auquel cas on considère
  // qu'il est "raté" et on passe au jour suivant (les vidéos manquantes
  // restent accessibles depuis le planning complet).
  //
  // Exception : si le jour précédent a été entièrement bouclé aujourd'hui, on
  // reste dessus jusqu'au lendemain plutôt que de pousser tout de suite la
  // séance du jour suivant — l'utilisateur voit sa séance du jour terminée.
  const getNextDayGroup = useCallback(
    (challengeId) => {
      const today = new Date().toISOString().slice(0, 10)
      const weeks = getChallengeWeeks(challengeId)
      let fallback = null
      let finishedTodayGroup = null
      for (const week of weeks) {
        for (const day of week.jours) {
          const group = { semaine: week.semaine, jour: day.jour, exercises: day.exercises }
          if (day.done) {
            const finishedToday = day.exercises.every((ex) => {
              const date = completedDates.get(ex.id)
              return date && date >= today
            })
            finishedTodayGroup = finishedToday ? group : null
            continue
          }
          if (!fallback) fallback = group
          const startedOnPreviousDay = day.exercises.some((ex) => {
            const date = completedDates.get(ex.id)
            return date && date < today
          })
          if (startedOnPreviousDay) continue
          // Le jour juste avant celui-ci a été terminé aujourd'hui : on y reste.
          if (finishedTodayGroup) return finishedTodayGroup
          return group
        }
      }
      // Plus aucun jour non terminé, mais le dernier a été bouclé aujourd'hui :
      // on reste sur ce jour plutôt que d'afficher "challenge terminé".
      if (finishedTodayGroup) return finishedTodayGroup
      // Tous les jours restants ont été entamés un jour précédent sans être
      // terminés (ex. challenge à l'arrêt) : on retombe sur le premier non
      // terminé plutôt que de déclarer le challenge fini.
      return fallback
    },
    [getChallengeWeeks, completedDates]
  )

  // Streak global : jours consécutifs avec au moins une séance faite, tous
  // challenges confondus.
  const streak = useMemo(() => computeStreak(progress), [progress])

  const globalStats = useMemo(() => {
    const totalExercises = exercises.length
    const doneCount = exercises.filter((e) => completedIds.has(e.id)).length
    const totalMinutesDone = exercises
      .filter((e) => completedIds.has(e.id))
      .reduce((sum, e) => sum + (e.duree_min || 0), 0)
    const pct = totalExercises ? Math.round((doneCount / totalExercises) * 100) : 0
    return { totalExercises, doneCount, totalMinutesDone, pct }
  }, [exercises, completedIds])

  const toggleComplete = useCallback(
    async (exerciseId, completed) => {
      const next = await setExerciseCompleted(userId, exerciseId, completed)
      setProgress(next)
    },
    [userId]
  )

  const toggleFavorite = useCallback(
    async (exerciseId, isFav) => {
      const next = await setFavorite(userId, exerciseId, isFav)
      setFavorites(next)
    },
    [userId]
  )

  const toggleChallengeActive = useCallback(
    async (challengeId, active) => {
      const next = await setChallengeActive(userId, challengeId, active)
      setActiveChallengeIds(next)
    },
    [userId]
  )

  const findExercise = useCallback(
    (exerciseId) => exercises.find((e) => e.id === exerciseId),
    [exercises]
  )

  const findChallenge = useCallback(
    (challengeId) => challenges.find((c) => c.id === challengeId),
    [challenges]
  )

  return {
    challenges,
    exercises,
    progress,
    completedIds,
    favoriteIds,
    activeChallengeIds: effectiveActiveIds,
    streak,
    globalStats,
    loading,
    error,
    getChallengeExercises,
    getChallengeWeeks,
    getChallengeStats,
    getNextDayGroup,
    findExercise,
    findChallenge,
    toggleComplete,
    toggleFavorite,
    toggleChallengeActive,
  }
}
