import { useRef, useEffect } from 'react';
import { clickSound } from '../utils/sound';
import { canFormWord, isValidWord } from '../utils/dictionary';

const PauseIcon = () => (
  <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
    <rect x="0" y="0" width="4" height="16" rx="1" />
    <rect x="10" y="0" width="4" height="16" rx="1" />
  </svg>
);

const PlayIcon = () => (
  <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
    <polygon points="0,0 14,8 0,16" />
  </svg>
);

function NeonButton({ onClick, disabled, children, color, square }) {
  const ref = useRef(null);
  const dimColor = disabled ? 'rgba(255,255,255,0.2)' : color;

  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => { if (ref.current) ref.current.style.opacity = '0.6'; }}
      onMouseUp={() => { if (ref.current) ref.current.style.opacity = '1'; }}
      onMouseLeave={() => { if (ref.current) ref.current.style.opacity = '1'; }}
      style={{
        background: 'transparent',
        border: `2px solid ${dimColor}`,
        borderRadius: 4,
        color: dimColor,
        fontFamily: "'BoutiqueBitmap', sans-serif",
        fontWeight: 700,
        fontSize: 13,
        width: square ? 42 : undefined,
        padding: square ? 0 : '7px 16px',
        height: 42,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: 1,
        boxShadow: disabled ? 'none' : `0 0 8px ${color}44`,
        textShadow: disabled ? 'none' : `0 0 6px ${color}`,
        transition: 'opacity 0.1s',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

function InputBar({ typed, onSubmit, onPause, paused, grid }) {
  const inputRef = useRef(null);

  // Keep input blurred — keyboard handled globally in Game
  useEffect(() => {
    if (inputRef.current) inputRef.current.blur();
  });
  const enough = typed.length >= 3;
  const inDict = enough && isValidWord(typed);
  const canForm = inDict && canFormWord(typed, grid);
  // red = not a real word; orange = real word but letters not on board; green = ready to submit
  const inputBorder = !enough
    ? 'rgba(255,255,255,0.2)'
    : canForm
    ? '#33ee66'
    : inDict
    ? '#ffaa33'
    : '#ee4455';
  const inputGlow = canForm
    ? '0 0 8px #33ee6644'
    : inDict
    ? '0 0 8px #ffaa3344'
    : enough
    ? '0 0 8px #ee445544'
    : 'none';

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', width: '100%', marginTop: 16, boxSizing: 'border-box' }}>
      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={() => {}}
        readOnly
        placeholder="TYPE A WORD..."
        maxLength={12}
        style={{
          flex: 1,
          minWidth: 0,
          background: 'rgba(255,255,255,0.05)',
          border: `2px solid ${inputBorder}`,
          borderRadius: 4,
          color: '#ffffff',
          fontFamily: "'BoutiqueBitmap', sans-serif",
          fontWeight: 700,
          fontSize: 14,
          padding: '0 14px',
          height: 42,
          outline: 'none',
          letterSpacing: 3,
          boxShadow: inputGlow,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          textTransform: 'uppercase',
          boxSizing: 'border-box',
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      <NeonButton onClick={onSubmit} disabled={!canForm} color="#33ee66">
        ENTER
      </NeonButton>
      <NeonButton onClick={() => { clickSound(); onPause(); }} color="#00ccee" square>
        {paused ? <PlayIcon /> : <PauseIcon />}
      </NeonButton>
    </div>
  );
}

export default InputBar;
