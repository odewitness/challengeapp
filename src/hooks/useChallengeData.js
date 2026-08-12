import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getChallenges,
  getExercises,
  getProgress,
  setExerciseCompleted,
  getFavorites,
  setFavorite,
} from '../lib/dataService'
import { computeStreak } from '../lib/streak'

export function useChallengeData(userId) {
  const [challenges, setChallenges] = useState([])
  const [challengeId, setChallengeId] = useState(null)
  const [exercises, setExercises] = useState([])
  const [progress, setProgress] = useState([])
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const chs = await getChallenges()
        if (cancelled) return
        setChallenges(chs)
        const firstId = chs[0]?.id ?? null
        setChallengeId((prev) => prev ?? firstId)
      } catch (e) {
        setError(e.message ?? String(e))
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!challengeId || !userId) return
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const [ex, prog, favs] = await Promise.all([
          getExercises(challengeId),
          getProgress(userId),
          getFavorites(userId),
        ])
        if (cancelled) return
        setExercises(ex)
        setProgress(prog)
        setFavorites(favs)
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
  }, [challengeId, userId])

  const completedIds = useMemo(
    () => new Set(progress.map((p) => p.exercise_id)),
    [progress]
  )
  const favoriteIds = useMemo(() => new Set(favorites), [favorites])

  const weeks = useMemo(() => {
    const byWeek = new Map()
    for (const ex of exercises) {
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
  }, [exercises, completedIds])

  const streak = useMemo(() => computeStreak(progress), [progress])

  const stats = useMemo(() => {
    const totalExercises = exercises.length
    const doneCount = exercises.filter((e) => completedIds.has(e.id)).length
    const totalMinutesDone = exercises
      .filter((e) => completedIds.has(e.id))
      .reduce((sum, e) => sum + (e.duree_min || 0), 0)
    const pct = totalExercises ? Math.round((doneCount / totalExercises) * 100) : 0
    return { totalExercises, doneCount, totalMinutesDone, pct }
  }, [exercises, completedIds])

  // "Reprendre où j'en étais" : le premier exercice non complété, dans l'ordre.
  const nextExercise = useMemo(
    () => exercises.slice().sort((a, b) => a.ordre - b.ordre).find((e) => !completedIds.has(e.id)),
    [exercises, completedIds]
  )

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

  return {
    challenges,
    challengeId,
    setChallengeId,
    exercises,
    progress,
    weeks,
    completedIds,
    favoriteIds,
    streak,
    stats,
    nextExercise,
    loading,
    error,
    toggleComplete,
    toggleFavorite,
  }
}
