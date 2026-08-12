import { useEffect } from 'react'

const LS_KEY = 'reminder_settings' // { enabled, time: 'HH:MM', lastFiredDate }

export function getReminderSettings() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) ?? { enabled: false, time: '08:00' }
  } catch {
    return { enabled: false, time: '08:00' }
  }
}

export function saveReminderSettings(settings) {
  localStorage.setItem(LS_KEY, JSON.stringify(settings))
}

// Vérifie régulièrement (tant que l'app/PWA est ouverte) si le rappel du jour
// doit se déclencher. Ce n'est pas une vraie push notification serveur : sans
// backend, un rappel fiable même app fermée demanderait un service de push
// (ex. web-push + une fonction Supabase Edge). Ici, ça fonctionne bien pour
// une PWA installée qu'on garde en tâche de fond ou qu'on rouvre dans la journée.
export function useDailyReminder() {
  useEffect(() => {
    const check = () => {
      const settings = getReminderSettings()
      if (!settings.enabled || Notification?.permission !== 'granted') return

      const now = new Date()
      const todayKey = now.toISOString().slice(0, 10)
      if (settings.lastFiredDate === todayKey) return

      const [h, m] = settings.time.split(':').map(Number)
      const target = new Date()
      target.setHours(h, m, 0, 0)

      if (now >= target) {
        new Notification('Ton étirement du jour t’attend 🌿', {
          body: 'Prends quelques minutes pour ta séance.',
          icon: '/icons/icon-192.png',
        })
        saveReminderSettings({ ...settings, lastFiredDate: todayKey })
      }
    }

    check()
    const id = setInterval(check, 60 * 1000)
    return () => clearInterval(id)
  }, [])
}
