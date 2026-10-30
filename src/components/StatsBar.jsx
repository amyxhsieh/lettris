// Arcade-style score display — like the 1UP/2UP panel in classic games
function StatItem({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
      <span
        style={{
          fontFamily: "'BoutiqueBitmap', sans-serif",
          fontSize: 'max(10px, calc(var(--cell) * 0.24))',
          letterSpacing: 2,
          color: '#ffffff',
          opacity: 0.55,
          textTransform: 'uppercase',
          marginBottom: 2,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "'BoutiqueBitmap', sans-serif",
          fontWeight: 700,
          fontSize: 'max(22px, calc(var(--cell) * 0.52))',
          color: color || '#33ff66',
          textShadow: `0 0 8px ${color || '#33ff66'}, 0 0 20px ${color || '#33ff66'}66`,
          letterSpacing: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function StatsBar({ score, middle, wordsLabel, combo, comboBanner }) {
  const comboColor =
    combo >= 4 ? '#ff66aa'
    : combo === 3 ? '#ffaa44'
    : combo === 2 ? '#ddccff'
    : '#33ff66';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        padding: '8px 0',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        marginBottom: 10,
        background: 'rgba(0,0,0,0.25)',
      }}
    >
      <StatItem label="Score" value={score.toLocaleString()} color="#33ff66" />
      <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)' }} />
      <StatItem label={middle.label} value={middle.value} color={middle.color} />
      <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)' }} />
      <StatItem label="Words" value={wordsLabel} color="#00ccee" />
      <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)' }} />
      <div style={{ position: 'relative' }}>
        <StatItem
          label="Combo"
          value={combo > 1 ? `×${combo}` : '–'}
          color={comboColor}
        />
        {comboBanner && (
          <div
            key={comboBanner.key}
            className="anim-combo-banner"
            style={{
              position: 'absolute',
              top: '50%',
              left: 'calc(100% + 8px)',
              transform: 'translateY(-50%)',
              fontFamily: "'BoutiqueBitmap', sans-serif",
              fontWeight: 900,
              fontSize: 18,
              letterSpacing: 4,
              color: comboBanner.color,
              textShadow: `0 0 10px ${comboBanner.color}, 0 0 24px ${comboBanner.color}88`,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
            }}
          >
            {comboBanner.text}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatsBar;
