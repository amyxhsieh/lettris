const OUTLINE = '-1px -1px 0 rgba(40,70,120,0.4), 1px -1px 0 rgba(40,70,120,0.4), -1px 1px 0 rgba(40,70,120,0.4), 1px 1px 0 rgba(40,70,120,0.4)';

function StatChip({ label, value, accent }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(180deg, #8eccc0 0%, #62aaaa 100%)',
        border: '2px solid #4a8a88',
        borderRadius: 999,
        boxShadow: '0 3px 0 #4a8a88, inset 0 2px 0 rgba(255,255,255,0.35)',
        padding: '4px 18px 6px',
        minWidth: 72,
      }}
    >
      <span
        style={{
          fontSize: 9,
          letterSpacing: 1,
          color: '#ffffff',
          fontFamily: "'BoutiqueBitmap', sans-serif",
          textShadow: OUTLINE,
          textTransform: 'uppercase',
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>
      <span
        className={accent ? 'anim-pulse' : ''}
        style={{
          fontSize: 22,
          fontWeight: 700,
          fontFamily: "'BoutiqueBitmap', sans-serif",
          color: accent || '#fff8cc',
          textShadow: OUTLINE,
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function StatsBar({ score, level, wordsFound, combo }) {
  const comboAccent =
    combo >= 4 ? '#ffaacc'
    : combo === 3 ? '#ffcc88'
    : combo === 2 ? '#ffe688'
    : null;

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        gap: 6,
        marginBottom: 10,
      }}
    >
      <StatChip label="Score" value={score.toLocaleString()} />
      <StatChip label="Level" value={level} />
      <StatChip label="Words" value={wordsFound} />
      <StatChip
        label="Combo"
        value={combo > 1 ? `×${combo}` : '–'}
        accent={combo > 1 ? comboAccent : null}
      />
    </div>
  );
}

export default StatsBar;
