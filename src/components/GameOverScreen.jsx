import { useState, useEffect } from 'react';
import { getScores } from '../utils/storage';
import { clickSound } from '../utils/sound';

function GameOverScreen({ score, wordsFound, level, onPlayAgain, onQuit, playerName }) {
  const [rank, setRank] = useState(null);

  useEffect(() => {
    const scores = getScores();
    const idx = scores.findIndex(
      (s) => s.score === score && s.name.toUpperCase() === (playerName || '').toUpperCase()
    );
    if (idx !== -1) setRank(idx + 1);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(4,4,16,0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: 'rgba(8,8,28,0.95)',
          border: '1px solid rgba(0,200,240,0.3)',
          borderRadius: 8,
          padding: '40px 52px',
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(0,180,220,0.12), 0 0 80px rgba(0,0,0,0.6)',
          minWidth: 300,
        }}
      >
        <h1
          style={{
            fontFamily: "'BoutiqueBitmap', sans-serif",
            fontWeight: 900,
            fontSize: 48,
            letterSpacing: 4,
            color: '#ff4466',
            margin: '0 0 4px',
            textShadow: '0 0 12px #ff4466, 0 0 40px #ff446655',
          }}
        >
          GAME OVER
        </h1>
        <p
          style={{
            fontFamily: "'BoutiqueBitmap', sans-serif",
            color: 'rgba(255,255,255,0.35)',
            fontSize: 11,
            letterSpacing: 3,
            marginBottom: 16,
          }}
        >
          COLUMN OVERFLOW
        </p>

        {/* Player name */}
        {playerName && (
          <p
            style={{
              fontFamily: "'BoutiqueBitmap', sans-serif",
              color: 'rgba(255,255,255,0.5)',
              fontSize: 12,
              letterSpacing: 3,
              marginBottom: 8,
              marginTop: 0,
            }}
          >
            {playerName.toUpperCase()}
          </p>
        )}

        {/* Rank */}
        {rank !== null && (
          <p
            style={{
              fontFamily: "'BoutiqueBitmap', sans-serif",
              color: '#00eeff',
              fontSize: 14,
              letterSpacing: 3,
              marginBottom: 16,
              marginTop: 0,
              textShadow: '0 0 8px #00eeff88',
            }}
          >
            RANK #{rank}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {[
            { label: 'FINAL SCORE',   value: score.toLocaleString(), color: '#33ff66' },
            { label: 'WORDS FOUND',   value: wordsFound,             color: '#00ccee' },
            { label: 'LEVEL REACHED', value: level,                  color: '#00ccee' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 18px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4,
              }}
            >
              <span
                style={{
                  fontFamily: "'BoutiqueBitmap', sans-serif",
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: 11,
                  letterSpacing: 2,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontFamily: "'BoutiqueBitmap', sans-serif",
                  fontWeight: 700,
                  fontSize: 22,
                  color,
                  textShadow: `0 0 8px ${color}88`,
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => { clickSound(); onPlayAgain(); }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(51,255,102,0.12)'; e.currentTarget.style.boxShadow = '0 0 16px #33ff6644'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = '0 0 8px #33ff6622'; }}
            style={{
              fontFamily: "'BoutiqueBitmap', sans-serif",
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: 4,
              padding: '12px 40px',
              background: 'transparent',
              border: '2px solid #33ff66',
              borderRadius: 4,
              color: '#33ff66',
              cursor: 'pointer',
              boxShadow: '0 0 8px #33ff6622',
              textShadow: '0 0 8px #33ff66',
              transition: 'background 0.15s, box-shadow 0.15s',
            }}
          >
            PLAY AGAIN
          </button>

          <button
            onClick={() => { clickSound(); onQuit(); }}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: "'BoutiqueBitmap', sans-serif",
              fontSize: 10,
              letterSpacing: 2,
              color: 'rgba(255,255,255,0.25)',
              cursor: 'pointer',
              padding: '4px 0',
              textDecoration: 'underline',
            }}
          >
            QUIT TO MENU
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameOverScreen;
