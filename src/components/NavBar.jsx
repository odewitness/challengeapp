import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: "Aujourd'hui", icon: HomeIcon },
  { to: '/challenges', label: 'Challenges', icon: ListIcon },
  { to: '/calendar', label: 'Calendrier', icon: CalendarIcon },
  { to: '/stats', label: 'Stats', icon: StatsIcon },
  { to: '/favoris', label: 'Favoris', icon: HeartIcon },
]

export default function NavBar() {
  return (
    <nav className="navbar" aria-label="Navigation principale">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) => `navbar-item${isActive ? ' active' : ''}`}
        >
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
      <style>{`
        .navbar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--color-bg-raised);
          border-top: 1px solid var(--color-line);
          display: flex;
          justify-content: space-around;
          padding: 8px 4px calc(8px + env(safe-area-inset-bottom));
          max-width: 640px;
          margin: 0 auto;
          z-index: 20;
        }
        .navbar-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-ink-faint);
          text-decoration: none;
          padding: 4px 10px;
          border-radius: 10px;
        }
        .navbar-item.active {
          color: var(--color-primary-dark);
          background: var(--color-primary-tint);
        }
        .navbar-item svg { width: 20px; height: 20px; }
      `}</style>
    </nav>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </svg>
  )
}
function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="3.5" cy="6" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="3.5" cy="18" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4M7 14h.01M12 14h.01M17 14h.01M7 17h.01M12 17h.01" />
    </svg>
  )
}
function StatsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  )
}
function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20s-7-4.35-9.5-8.5C.5 8 2 4.5 5.5 4.5c2 0 3.5 1.2 4.5 2.7C11 5.7 12.5 4.5 14.5 4.5 18 4.5 19.5 8 19.5 11.5 17 15.65 12 20 12 20z" />
    </svg>
  )
}
