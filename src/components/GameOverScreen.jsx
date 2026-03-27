const OUTLINE_LG = '-2px -2px 0 rgba(100,20,20,0.45), 2px -2px 0 rgba(100,20,20,0.45), -2px 2px 0 rgba(100,20,20,0.45), 2px 2px 0 rgba(100,20,20,0.45)';
const OUTLINE_SM = '-1px -1px 0 rgba(40,70,120,0.45), 1px -1px 0 rgba(40,70,120,0.45), -1px 1px 0 rgba(40,70,120,0.45), 1px 1px 0 rgba(40,70,120,0.45)';

function GameOverScreen({ score, wordsFound, level, onPlayAgain }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(60,90,140,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        style={{
          background: 'linear-gradient(180deg, #c2e0f8 0%, #8abcdc 100%)',
          border: '3px solid rgba(255,255,255,0.7)',
          borderRadius: 20,
          padding: '36px 48px',
          textAlign: 'center',
          boxShadow: '0 6px 0 rgba(80,130,190,0.45)',
          minWidth: 300,
        }}
      >
        <h1
          style={{
            fontFamily: "'BoutiqueBitmap', sans-serif",
            fontWeight: 900,
            fontSize: 44,
            letterSpacing: 4,
            color: '#e06070',
            margin: '0 0 4px',
            textShadow: OUTLINE_LG,
          }}
        >
          GAME OVER
        </h1>
        <p
          style={{
            fontFamily: "'BoutiqueBitmap', sans-serif",
            color: '#ffffff',
            fontSize: 11,
            letterSpacing: 3,
            marginBottom: 26,
            textShadow: OUTLINE_SM,
          }}
        >
          COLUMN OVERFLOW
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {[
            { label: 'FINAL SCORE', value: score.toLocaleString(), accent: '#ffe888' },
            { label: 'WORDS FOUND', value: wordsFound, accent: '#aaeebb' },
            { label: 'LEVEL REACHED', value: level, accent: '#aaddff' },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(180deg, #8eccc0 0%, #66aaaa 100%)',
                border: '2px solid #4a8a88',
                borderRadius: 999,
                padding: '6px 20px',
                boxShadow: '0 3px 0 #4a8a88',
              }}
            >
              <span
                style={{
                  fontFamily: "'BoutiqueBitmap', sans-serif",
                  color: '#ffffff',
                  fontSize: 11,
                  letterSpacing: 1,
                  textShadow: OUTLINE_SM,
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontFamily: "'BoutiqueBitmap', sans-serif",
                  fontWeight: 700,
                  fontSize: 22,
                  color: accent,
                  textShadow: OUTLINE_SM,
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onPlayAgain}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = '0 1px 0 #448844'; }}
          onMouseUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 5px 0 #448844'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 5px 0 #448844'; }}
          style={{
            fontFamily: "'BoutiqueBitmap', sans-serif",
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: 3,
            padding: '12px 40px',
            background: 'linear-gradient(180deg, #90cc88 0%, #66aa60 100%)',
            border: '2px solid #448844',
            borderRadius: 999,
            color: '#ffffff',
            cursor: 'pointer',
            boxShadow: '0 5px 0 #448844',
            textShadow: OUTLINE_SM,
            transition: 'box-shadow 0.05s, transform 0.05s',
          }}
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}

export default GameOverScreen;
