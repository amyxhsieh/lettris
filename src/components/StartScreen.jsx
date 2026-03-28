import { useState, useEffect } from 'react';

// Deterministic star positions (avoid re-generating on re-render)
const STARS = Array.from({ length: 80 }, (_, i) => ({
  left: ((i * 137.508) % 100).toFixed(2),
  top:  ((i * 97.3)   % 100).toFixed(2),
  size: (i % 3) + 1,
  opacity: (0.2 + (i % 5) * 0.12).toFixed(2),
}));

function StartScreen({ onStart }) {
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setBlink((b) => !b), 600);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(180deg, #080818 0%, #10102a 60%, #0d0d22 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        gap: 32,
        overflow: 'hidden',
      }}
    >
      {/* Starfield */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {STARS.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: '#ffffff',
              opacity: s.opacity,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', position: 'relative' }}>
        <h1
          style={{
            fontFamily: "'BoutiqueBitmap', sans-serif",
            fontWeight: 900,
            fontSize: 72,
            letterSpacing: 10,
            margin: 0,
            color: '#00ddff',
            textShadow: '0 0 12px #00ddff, 0 0 40px #00ddff88, 0 0 80px #00ddff33',
            lineHeight: 1,
          }}
        >
          LETTRIS
        </h1>
        <p
          style={{
            fontFamily: "'BoutiqueBitmap', sans-serif",
            color: '#00ddff',
            fontSize: 14,
            letterSpacing: 5,
            margin: '12px 0 0',
            textShadow: '0 0 8px #00ddff, 0 0 40px #00ddff88, 0 0 80px #00ddff33',
          }}
        >
          WORD × TETRIS
        </p>
      </div>

      {/* PRESS START — arcade blink */}
      <div
        style={{
          fontFamily: "'BoutiqueBitmap', sans-serif",
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 5,
          color: '#ffee44',
          textShadow: '0 0 10px #ffee44, 0 0 30px #ffee4466',
          opacity: blink ? 1 : 0,
          transition: 'opacity 0.05s',
          cursor: 'pointer',
        }}
        onClick={onStart}
      >
        PRESS START
      </div>

      {/* Instructions */}
      <div
        style={{
          background: 'rgba(0,0,0,0.45)',
          border: '1px solid rgba(0,200,240,0.2)',
          borderRadius: 6,
          padding: '16px 28px',
          maxWidth: 380,
          width: '88%',
          boxShadow: '0 0 20px rgba(0,180,220,0.06)',
        }}
      >
        <h3
          style={{
            fontFamily: "'BoutiqueBitmap', sans-serif",
            color: '#00ccee',
            fontSize: 12,
            letterSpacing: 3,
            marginTop: 0,
            marginBottom: 12,
            textAlign: 'center',
            textShadow: '0 0 6px #00ccee',
          }}
        >
          HOW TO PLAY
        </h3>
        <ul
          style={{
            fontFamily: "'BoutiqueBitmap', sans-serif",
            color: 'rgba(255,255,255,0.75)',
            fontSize: 11,
            lineHeight: 2.2,
            paddingLeft: 18,
            margin: 0,
          }}
        >
          <li>Letters fall from the top of the grid</li>
          <li>← → to move &nbsp;|&nbsp; ↓ to speed up</li>
          <li>SPACE to hard-drop instantly</li>
          <li>Type a word (3+ letters) → ENTER to clear</li>
          <li><span style={{ color: '#00eeff' }}>CYAN</span> = vowels &nbsp;|&nbsp; <span style={{ color: '#44ff88' }}>GREEN</span> = consonants</li>
          <li>Chain words fast for COMBO multipliers!</li>
          <li>ESC to pause / resume</li>
        </ul>
      </div>
    </div>
  );
}

export default StartScreen;
