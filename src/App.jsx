import { Routes, Route, Link } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useChallenges } from './hooks/useChallenges'
import { useDailyReminder } from './hooks/useDailyReminder'
import { useTheme } from './lib/theme'
import NavBar from './components/NavBar'
import Today from './pages/Today'
import Challenges from './pages/Challenges'
import ChallengePlanning from './pages/ChallengePlanning'
import ChallengeEditor from './pages/ChallengeEditor'
import Session from './pages/Session'
import SessionPlaylist from './pages/SessionPlaylist'
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
  const data = useChallenges(auth.user.id)

  return (
    <div className="app-shell">
      <div className="top-bar">
        <Link to="/" className="brand">
          Mon Challenge
        </Link>
        <div className="top-bar-actions">
          <ThemeToggle />
          <Link to="/settings" aria-label="Réglages" className="settings-link">
            <GearIcon />
          </Link>
        </div>
      </div>

      <Routes>
        <Route path="/" element={<Today data={data} />} />
        <Route path="/challenges" element={<Challenges data={data} />} />
        <Route path="/challenges/new" element={<ChallengeEditor data={data} />} />
        <Route path="/challenges/:challengeId" element={<ChallengePlanning data={data} />} />
        <Route path="/challenges/:challengeId/edit" element={<ChallengeEditor data={data} />} />
        <Route path="/session/:exerciseId" element={<Session data={data} />} />
        <Route
          path="/play/:challengeId/:semaine/:jour"
          element={<SessionPlaylist data={data} />}
        />
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
        .top-bar-actions { display: flex; align-items: center; gap: 6px; }
        .settings-link { color: var(--color-ink-faint); display: flex; }
        .theme-toggle {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; padding: 0;
          border: none; background: none; border-radius: 999px;
          color: var(--color-ink-faint);
        }
        .theme-toggle:hover { background: var(--color-primary-tint); color: var(--color-primary-dark); }
      `}</style>
    </div>
  )
}

function ThemeToggle() {
  const { resolved, setPreference } = useTheme()
  const nextIsDark = resolved !== 'dark'
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setPreference(nextIsDark ? 'dark' : 'light')}
      aria-label={nextIsDark ? 'Passer en mode sombre' : 'Passer en mode clair'}
      title={nextIsDark ? 'Mode sombre' : 'Mode clair'}
    >
      {resolved === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
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
