// Élément signature de l'app : un anneau qui évoque un cycle de respiration
// (inspire/expire) plutôt qu'une simple barre de progression générique.
// Le trait se referme progressivement selon le pourcentage complété, et
// pulse doucement pour rappeler le rythme d'une respiration au repos.
export default function BreathRing({ pct = 0, size = 96, label, sublabel }) {
  const stroke = 8
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c

  return (
    <div
      className="breath-ring"
      style={{ width: size, height: size, position: 'relative' }}
      role="img"
      aria-label={`${label ?? ''} ${pct}% complété`}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth={stroke}
        />
        <circle
          className="breath-ring-fg"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600 }}>
          {pct}%
        </span>
        {sublabel && (
          <span style={{ fontSize: 10, color: 'var(--color-ink-faint)' }}>{sublabel}</span>
        )}
      </div>
    </div>
  )
}
