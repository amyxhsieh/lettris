
function StartScreen({ onStart }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 50%, #0a0a2a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        gap: 32,
      }}
    >
      {/* Stars background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
        }}
      >
        {Array.from({ length: 80 }, (_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              borderRadius: '50%',
              background: '#ffffff',
              opacity: Math.random() * 0.7 + 0.1,
              animation: `cosmicPulse ${Math.random() * 3 + 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', position: 'relative' }}>
        <h1
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 900,
            fontSize: 72,
            letterSpacing: 12,
            margin: 0,
            background: 'linear-gradient(90deg, #ff4488, #ff8844, #ffdd44, #44ff88, #44aaff, #aa44ff, #ff4488)',
            backgroundSize: '200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'rainbowText 4s linear infinite',
            textShadow: 'none',
          }}
        >
          LETTRIS
        </h1>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: '#8080c0',
            fontSize: 13,
            letterSpacing: 4,
            margin: '8px 0 0',
            textTransform: 'uppercase',
          }}
        >
          Word × Tetris
        </p>
      </div>

      {/* Instructions */}
      <div
        style={{
          background: 'rgba(20,20,50,0.8)',
          border: '1px solid #3a3a7a',
          borderRadius: 12,
          padding: '24px 36px',
          maxWidth: 420,
          width: '90%',
        }}
      >
        <h3
          style={{
            fontFamily: "'Orbitron', sans-serif",
            color: '#8080ff',
            fontSize: 14,
            letterSpacing: 3,
            marginTop: 0,
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          HOW TO PLAY
        </h3>
        <ul
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: '#c0c0e0',
            fontSize: 13,
            lineHeight: 2,
            paddingLeft: 20,
            margin: 0,
          }}
        >
          <li>Letters fall from the top of the grid</li>
          <li>← → to move, ↓ to speed up</li>
          <li>SPACE to hard-drop the letter instantly</li>
          <li>Type a word (3+ letters) and press ENTER</li>
          <li>Letters are removed from the board!</li>
          <li>Chain words fast for combo multipliers</li>
          <li>Don't let the column fill to the top</li>
          <li>ESC to pause / resume</li>
        </ul>
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: 4,
          padding: '16px 48px',
          background: 'linear-gradient(135deg, rgba(80,80,255,0.2), rgba(120,40,200,0.2))',
          border: '2px solid #6060ff',
          borderRadius: 8,
          color: '#c0c0ff',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(100,100,255,0.3), 0 0 40px rgba(100,100,255,0.1)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background =
            'linear-gradient(135deg, rgba(100,100,255,0.4), rgba(160,60,240,0.4))';
          e.currentTarget.style.boxShadow =
            '0 0 30px rgba(120,120,255,0.5), 0 0 60px rgba(120,120,255,0.2)';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background =
            'linear-gradient(135deg, rgba(80,80,255,0.2), rgba(120,40,200,0.2))';
          e.currentTarget.style.boxShadow =
            '0 0 20px rgba(100,100,255,0.3), 0 0 40px rgba(100,100,255,0.1)';
          e.currentTarget.style.color = '#c0c0ff';
        }}
      >
        START GAME
      </button>
    </div>
  );
}

export default StartScreen;
