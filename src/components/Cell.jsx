import { memo } from 'react';

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

// Cyan for vowels, green for consonants
const CYAN  = { border: '#00ccee', text: '#00eeff', bg: 'rgba(0,200,240,0.12)', glow: '0 0 6px #00ccee, 0 0 14px #00ccee66' };
const GREEN = { border: '#33ee66', text: '#44ff88', bg: 'rgba(50,220,100,0.10)', glow: '0 0 6px #33ee66, 0 0 14px #33ee6655' };

const Cell = memo(function Cell({ letter, isClearing, isFalling }) {
  const filled = Boolean(letter);
  const palette = filled
    ? (VOWELS.has(letter.toUpperCase()) ? CYAN : GREEN)
    : null;

  let animClass = '';
  if (isClearing) animClass = 'anim-pop-out';
  else if (isFalling) animClass = 'anim-fall-in';

  return (
    <div
      className={`cell ${animClass}`}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 'max(4px, calc(var(--cell) * 0.12))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700,
        fontSize: 'calc(var(--cell) * 0.52)',
        userSelect: 'none',
        cursor: 'default',
        transition: 'box-shadow 0.1s',
        ...(filled
          ? {
              background: palette.bg,
              border: `2px solid ${palette.border}`,
              boxShadow: palette.glow,
              color: palette.text,
              textShadow: `0 0 8px ${palette.border}`,
            }
          : {
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: 'transparent',
            }),
      }}
    >
      {letter || ''}
    </div>
  );
});

export default Cell;
