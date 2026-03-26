
function GameOverScreen({ score, wordsFound, level, onPlayAgain }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(5,5,15,0.88)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #0d0d2e 0%, #1a1a4a 100%)',
          border: '2px solid #ff4466',
          borderRadius: 16,
          padding: '40px 56px',
          textAlign: 'center',
          boxShadow:
            '0 0 40px rgba(255,60,80,0.3), 0 0 80px rgba(255,60,80,0.1), inset 0 0 40px rgba(0,0,0,0.4)',
          minWidth: 320,
        }}
      >
        <h1
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 900,
            fontSize: 48,
            letterSpacing: 6,
            color: '#ff4466',
            margin: '0 0 8px',
            textShadow: '0 0 20px #ff4466, 0 0 40px #ff446688',
          }}
        >
          GAME OVER
        </h1>

        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: '#6060a0',
            fontSize: 12,
            letterSpacing: 3,
            marginBottom: 32,
          }}
        >
          COLUMN OVERFLOW
        </p>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginBottom: 36,
          }}
        >
          {[
            { label: 'FINAL SCORE', value: score.toLocaleString(), color: '#ffdd44' },
            { label: 'WORDS FOUND', value: wordsFound, color: '#44ff88' },
            { label: 'LEVEL REACHED', value: level, color: '#44aaff' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 20px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#8080a0',
                  fontSize: 11,
                  letterSpacing: 2,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 700,
                  fontSize: 22,
                  color,
                  textShadow: `0 0 10px ${color}88`,
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onPlayAgain}
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 700,
            fontSize: 16,
            letterSpacing: 3,
            padding: '14px 40px',
            background: 'rgba(80,80,255,0.15)',
            border: '2px solid #6060ff',
            borderRadius: 8,
            color: '#c0c0ff',
            cursor: 'pointer',
            boxShadow: '0 0 16px rgba(100,100,255,0.25)',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(100,100,255,0.3)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.boxShadow = '0 0 24px rgba(120,120,255,0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(80,80,255,0.15)';
            e.currentTarget.style.color = '#c0c0ff';
            e.currentTarget.style.boxShadow = '0 0 16px rgba(100,100,255,0.25)';
          }}
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}

export default GameOverScreen;
