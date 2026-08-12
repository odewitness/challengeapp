import { Routes, Route, Link } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useChallengeData } from './hooks/useChallengeData'
import { useDailyReminder } from './hooks/useDailyReminder'
import NavBar from './components/NavBar'
import Dashboard from './pages/Dashboard'
import Session from './pages/Session'
import CalendarPage from './pages/Calendar'
import StatsPage from './pages/Stats'
import FavoritesPage from './pages/Favorites'
import SettingsPage from './pages/Settings'
import Login from './pages/Login'

export default function App() {
  const auth = useAuth()
  useDailyReminder()

  if (auth.loading) {
    return <div className="page">Chargement…</div>
  }

  if (!auth.user) {
    return <Login auth={auth} />
  }

  return <AuthedApp auth={auth} />
}

function AuthedApp({ auth }) {
  const data = useChallengeData(auth.user.id)

  return (
    <div className="app-shell">
      <div className="top-bar">
        <Link to="/" className="brand">
          Mon Challenge
        </Link>
        <Link to="/settings" aria-label="Réglages" className="settings-link">
          <GearIcon />
        </Link>
      </div>

      <Routes>
        <Route path="/" element={<Dashboard data={data} />} />
        <Route path="/session/:exerciseId" element={<Session data={data} />} />
        <Route path="/calendar" element={<CalendarPage data={data} />} />
        <Route path="/stats" element={<StatsPage data={data} />} />
        <Route path="/favoris" element={<FavoritesPage data={data} />} />
        <Route path="/settings" element={<SettingsPage auth={auth} />} />
      </Routes>

      <NavBar />

      <style>{`
        .top-bar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px 0;
        }
        .brand { font-family: var(--font-display); font-weight: 600; font-size: 15px; text-decoration: none; color: var(--color-primary-dark); }
        .settings-link { color: var(--color-ink-faint); display: flex; }
      `}</style>
    </div>
  )
}

function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.02A1.65 1.65 0 009.09 3.09V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h.02a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.02c.24.62.79 1.05 1.51 1.05H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}
