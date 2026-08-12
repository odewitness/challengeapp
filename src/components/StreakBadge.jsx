export default function StreakBadge({ streak }) {
  if (streak <= 0) {
    return (
      <div className="tag" style={{ background: 'var(--color-line)', color: 'var(--color-ink-soft)' }}>
        Pas encore de série
      </div>
    )
  }
  return (
    <div className="tag" style={{ background: '#FBEFDA', color: 'var(--color-accent-gold)' }}>
      <FlameIcon /> {streak} {streak > 1 ? 'jours de suite' : 'jour de suite'}
    </div>
  )
}

function FlameIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2c1 3-3 4-3 8a3 3 0 006 0c1 1 2 2.5 2 4.5A5.5 5.5 0 016.5 20 5.5 5.5 0 011 14.5C1 9 7 7 12 2z" />
    </svg>
  )
}
