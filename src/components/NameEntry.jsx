import { useState } from 'react';
import { guestName } from '../utils/storage';
import { clickSound } from '../utils/sound';

function NameEntry({ onDone }) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);

  const useGuest = () => {
    clickSound();
    onDone(guestName());
  };

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      useGuest();
      return;
    }
    clickSound();
    onDone(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="YOUR NAME"
        maxLength={20}
        style={{
          fontFamily: "'BoutiqueBitmap', sans-serif",
          background: 'rgba(0,0,0,0.4)',
          border: `1px solid ${focused ? 'rgba(0,200,240,0.7)' : 'rgba(0,200,240,0.3)'}`,
          color: '#00eeff',
          fontSize: 16,
          letterSpacing: 3,
          padding: '8px 16px',
          borderRadius: 4,
          width: 220,
          outline: 'none',
          textAlign: 'center',
          textTransform: 'uppercase',
          transition: 'border-color 0.15s',
        }}
      />
      <style>{`
        input::placeholder {
          color: rgba(0,200,240,0.3);
        }
      `}</style>
      <button
        onClick={handleSubmit}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,221,255,0.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
        style={{
          background: 'none',
          border: '1px solid #00ddff',
          color: '#00ddff',
          fontFamily: "'BoutiqueBitmap', sans-serif",
          fontSize: 14,
          letterSpacing: 4,
          padding: '8px 24px',
          borderRadius: 4,
          cursor: 'pointer',
          textShadow: '0 0 8px #00ddff',
          boxShadow: '0 0 10px rgba(0,180,220,0.2)',
          transition: 'background 0.15s',
        }}
      >
        ENTER
      </button>
    </div>
      <button type="button" className="name-skip pressable" onClick={useGuest}>
        SKIP
      </button>
    </div>
  );
}

export default NameEntry;
