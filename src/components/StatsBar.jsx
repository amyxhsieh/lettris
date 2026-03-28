// Arcade-style score display — like the 1UP/2UP panel in classic games
function StatItem({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 72 }}>
      <span
        style={{
          fontFamily: "'BoutiqueBitmap', sans-serif",
          fontSize: 10,
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
          fontSize: 22,
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

function StatsBar({ score, level, wordsFound, combo }) {
  const comboColor =
    combo >= 4 ? '#ff66aa'
    : combo === 3 ? '#ffaa44'
    : combo === 2 ? '#ffee44'
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
        marginBottom: 18,
        background: 'rgba(0,0,0,0.25)',
      }}
    >
      <StatItem label="Score" value={score.toLocaleString()} color="#33ff66" />
      <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)' }} />
      <StatItem label="Level" value={level} color="#00ccee" />
      <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)' }} />
      <StatItem label="Words" value={wordsFound} color="#00ccee" />
      <div style={{ width: 1, height: 36, background: 'rgba(255,255,255,0.08)' }} />
      <StatItem
        label="Combo"
        value={combo > 1 ? `×${combo}` : '–'}
        color={comboColor}
      />
    </div>
  );
}

export default StatsBar;
