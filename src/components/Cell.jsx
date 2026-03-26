import { memo } from 'react';
import { getLetterColor, getLetterGlow } from '../utils/letters';

const Cell = memo(function Cell({ letter, isClearing, isFalling, color }) {
  const filled = Boolean(letter);
  const displayColor = color || (letter ? getLetterColor(letter) : null);
  const glow = filled ? getLetterGlow(letter) : 'none';

  let animClass = '';
  if (isClearing) animClass = 'anim-pop-out';
  else if (isFalling) animClass = 'anim-fall-in';
  else if (filled) animClass = '';

  return (
    <div
      className={`cell ${animClass}`}
      style={{
        width: 44,
        height: 44,
        border: filled
          ? `2px solid ${displayColor}`
          : '2px solid #2a2a4a',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700,
        fontSize: 20,
        color: filled ? displayColor : 'transparent',
        backgroundColor: filled ? 'rgba(10,10,26,0.85)' : 'rgba(10,10,26,0.4)',
        boxShadow: filled ? glow : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s, background-color 0.15s',
        userSelect: 'none',
        cursor: 'default',
      }}
    >
      {letter || ''}
    </div>
  );
});

export default Cell;
