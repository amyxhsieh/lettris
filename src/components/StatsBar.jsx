
function StatItem({ label, value, highlight, pulse }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: 80,
      }}
    >
      <span
        style={{
          fontSize: 10,
          letterSpacing: 2,
          color: '#6060a0',
          fontFamily: "'JetBrains Mono', monospace",
          textTransform: 'uppercase',
          marginBottom: 2,
        }}
      >
        {label}
      </span>
      <span
        className={pulse ? 'anim-pulse' : ''}
        style={{
          fontSize: 24,
          fontWeight: 700,
          fontFamily: "'Orbitron', sans-serif",
          color: highlight || '#c0c0ff',
          textShadow: highlight
            ? `0 0 10px ${highlight}, 0 0 20px ${highlight}55`
            : '0 0 8px rgba(180,180,255,0.4)',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function StatsBar({ score, level, wordsFound, combo }) {
  const comboColor =
    combo >= 4
      ? '#ff4488'
      : combo === 3
      ? '#ff8844'
      : combo === 2
      ? '#ffdd44'
      : '#c0c0ff';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        padding: '10px 0',
        background: 'rgba(10,10,26,0.7)',
        border: '1px solid #2a2a5a',
        borderRadius: 8,
        marginBottom: 8,
      }}
    >
      <StatItem label="Score" value={score.toLocaleString()} />
      <div style={{ width: 1, height: 40, background: '#2a2a5a' }} />
      <StatItem label="Level" value={level} />
      <div style={{ width: 1, height: 40, background: '#2a2a5a' }} />
      <StatItem label="Words" value={wordsFound} />
      <div style={{ width: 1, height: 40, background: '#2a2a5a' }} />
      <StatItem
        label="Combo"
        value={combo > 1 ? `x${combo}` : '–'}
        highlight={combo > 1 ? comboColor : null}
        pulse={combo > 1}
      />
    </div>
  );
}

export default StatsBar;
