import { useRef } from 'react';
import { canFormWord } from '../utils/dictionary';

function InputBar({ typed, onTyped, onSubmit, onPause, paused, grid }) {
  const inputRef = useRef(null);
  const canForm = typed.length >= 3 && canFormWord(typed, grid);
  const hasBadWord = typed.length >= 3 && !canForm;

  const borderColor = canForm
    ? '#44ff88'
    : hasBadWord
    ? '#ff4466'
    : '#3a3a6a';

  const glowColor = canForm
    ? '0 0 8px #44ff88, 0 0 16px #44ff8844'
    : hasBadWord
    ? '0 0 8px #ff4466, 0 0 16px #ff446644'
    : 'none';

  const handleKeyDown = (e) => {
    // Prevent arrow keys from doing default behavior (cursor movement)
    // but DO NOT propagate to game — game hook checks activeElement
    if (
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowRight' ||
      e.key === 'ArrowDown' ||
      e.key === 'ArrowUp'
    ) {
      // Let the game handle it by NOT preventing default only if we want cursor to stay
      // Actually, we stop propagation so the game doesn't move the piece
      e.stopPropagation();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        width: '100%',
        marginTop: 8,
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={(e) => {
          // Only allow alpha characters
          const val = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
          onTyped(val);
        }}
        onKeyDown={handleKeyDown}
        placeholder="TYPE A WORD..."
        maxLength={12}
        style={{
          flex: 1,
          background: 'rgba(10,10,26,0.9)',
          border: `2px solid ${borderColor}`,
          borderRadius: 6,
          color: '#e0e0ff',
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          fontSize: 18,
          padding: '8px 14px',
          outline: 'none',
          letterSpacing: 3,
          boxShadow: glowColor,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          textTransform: 'uppercase',
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      <button
        onClick={onSubmit}
        disabled={!canForm}
        style={{
          background: canForm ? 'rgba(68,255,136,0.15)' : 'rgba(255,255,255,0.05)',
          border: `2px solid ${canForm ? '#44ff88' : '#3a3a6a'}`,
          color: canForm ? '#44ff88' : '#6060a0',
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 700,
          fontSize: 13,
          padding: '8px 14px',
          borderRadius: 6,
          cursor: canForm ? 'pointer' : 'not-allowed',
          letterSpacing: 1,
          transition: 'all 0.2s',
          boxShadow: canForm ? '0 0 8px #44ff8844' : 'none',
        }}
      >
        ENTER
      </button>
      <button
        onClick={onPause}
        style={{
          background: 'rgba(100,100,200,0.1)',
          border: '2px solid #3a3a6a',
          color: '#8080c0',
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 700,
          fontSize: 13,
          padding: '8px 14px',
          borderRadius: 6,
          cursor: 'pointer',
          letterSpacing: 1,
          transition: 'all 0.2s',
          minWidth: 80,
        }}
      >
        {paused ? 'RESUME' : 'PAUSE'}
      </button>
    </div>
  );
}

export default InputBar;
