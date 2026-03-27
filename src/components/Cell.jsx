import { memo } from 'react';

const OUTLINE = '-1px -1px 0 rgba(40,70,120,0.45), 1px -1px 0 rgba(40,70,120,0.45), -1px 1px 0 rgba(40,70,120,0.45), 1px 1px 0 rgba(40,70,120,0.45)';

const Cell = memo(function Cell({ letter, isClearing, isFalling }) {
  const filled = Boolean(letter);
  let hue = 0;
  if (filled) {
    const charCode = letter.toUpperCase().charCodeAt(0);
    hue = ((charCode - 65) * (360 / 26) + 20) % 360;
  }

  let animClass = '';
  if (isClearing) animClass = 'anim-pop-out';
  else if (isFalling) animClass = 'anim-fall-in';

  return (
    <div
      className={`cell ${animClass}`}
      style={{
        width: 44,
        height: 44,
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700,
        fontSize: 20,
        userSelect: 'none',
        cursor: 'default',
        position: 'relative',
        ...(filled
          ? {
              background: `linear-gradient(180deg, hsl(${hue},55%,76%) 0%, hsl(${hue},55%,62%) 100%)`,
              border: `2px solid hsl(${hue},45%,50%)`,
              boxShadow: `0 3px 0 hsl(${hue},45%,44%), inset 0 2px 0 rgba(255,255,255,0.5)`,
              color: '#ffffff',
              textShadow: OUTLINE,
            }
          : {
              background: 'rgba(160,200,240,0.25)',
              border: '1px solid rgba(255,255,255,0.4)',
              color: 'transparent',
            }),
      }}
    >
      {letter || ''}
    </div>
  );
});

export default Cell;
