import { useRef } from 'react';
import { canFormWord } from '../utils/dictionary';

const BTN_OUTLINE = '-1px -1px 0 rgba(40,70,120,0.4), 1px -1px 0 rgba(40,70,120,0.4), -1px 1px 0 rgba(40,70,120,0.4), 1px 1px 0 rgba(40,70,120,0.4)';

function KutarButton({ onClick, disabled, label, colorTop, colorBot, border }) {
  const ref = useRef(null);
  return (
    <button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => {
        if (ref.current) {
          ref.current.style.transform = 'translateY(3px)';
          ref.current.style.boxShadow = `0 0px 0 ${border}`;
        }
      }}
      onMouseUp={() => {
        if (ref.current) {
          ref.current.style.transform = '';
          ref.current.style.boxShadow = `0 3px 0 ${border}`;
        }
      }}
      onMouseLeave={() => {
        if (ref.current) {
          ref.current.style.transform = '';
          ref.current.style.boxShadow = `0 3px 0 ${border}`;
        }
      }}
      style={{
        background: disabled
          ? 'linear-gradient(180deg, #c8c8c8, #aaaaaa)'
          : `linear-gradient(180deg, ${colorTop} 0%, ${colorBot} 100%)`,
        border: `2px solid ${disabled ? '#999' : border}`,
        borderRadius: 999,
        boxShadow: `0 3px 0 ${disabled ? '#999' : border}`,
        color: '#ffffff',
        fontFamily: "'BoutiqueBitmap', sans-serif",
        fontWeight: 700,
        fontSize: 13,
        padding: '7px 18px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: 1,
        textShadow: BTN_OUTLINE,
        transition: 'background 0.1s',
        whiteSpace: 'nowrap',
        opacity: disabled ? 0.55 : 1,
      }}
    >
      {label}
    </button>
  );
}

function InputBar({ typed, onTyped, onSubmit, onPause, paused, grid }) {
  const inputRef = useRef(null);
  const canForm = typed.length >= 3 && canFormWord(typed, grid);
  const hasBadWord = typed.length >= 3 && !canForm;

  const inputBorder = canForm ? '#7ec89a' : hasBadWord ? '#e08888' : 'rgba(255,255,255,0.6)';

  const handleKeyDown = (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
      e.stopPropagation();
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', width: '100%', marginTop: 8 }}>
      <input
        ref={inputRef}
        type="text"
        value={typed}
        onChange={(e) => {
          const val = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
          onTyped(val);
        }}
        onKeyDown={handleKeyDown}
        placeholder="TYPE A WORD..."
        maxLength={12}
        style={{
          flex: 1,
          background: 'rgba(255,255,255,0.85)',
          border: `2px solid ${inputBorder}`,
          borderRadius: 999,
          color: '#4466aa',
          fontFamily: "'BoutiqueBitmap', sans-serif",
          fontWeight: 700,
          fontSize: 16,
          padding: '7px 16px',
          outline: 'none',
          letterSpacing: 3,
          boxShadow: '0 3px 0 rgba(80,130,190,0.3)',
          transition: 'border-color 0.2s',
          textTransform: 'uppercase',
        }}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
      />
      <KutarButton
        onClick={onSubmit}
        disabled={!canForm}
        label="ENTER"
        colorTop="#90cc88"
        colorBot="#66aa60"
        border="#448844"
      />
      <KutarButton
        onClick={onPause}
        label={paused ? 'RESUME' : 'PAUSE'}
        colorTop="#e8cc70"
        colorBot="#c8a848"
        border="#9a7c30"
      />
    </div>
  );
}

export default InputBar;
