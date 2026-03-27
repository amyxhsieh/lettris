const OUTLINE_LG = '-2px -2px 0 rgba(40,70,140,0.5), 2px -2px 0 rgba(40,70,140,0.5), -2px 2px 0 rgba(40,70,140,0.5), 2px 2px 0 rgba(40,70,140,0.5)';
const OUTLINE_SM = '-1px -1px 0 rgba(40,70,120,0.45), 1px -1px 0 rgba(40,70,120,0.45), -1px 1px 0 rgba(40,70,120,0.45), 1px 1px 0 rgba(40,70,120,0.45)';

function StartScreen({ onStart }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(180deg, #c2e0f8 0%, #82b8e8 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        gap: 28,
        overflow: 'hidden',
      }}
    >
      {/* Soft decorative circles */}
      {[
        { size: 200, top: -70, left: -70, opacity: 0.18 },
        { size: 130, top: 10, right: -45, opacity: 0.14 },
        { size: 220, bottom: -90, right: -60, opacity: 0.16 },
        { size: 110, bottom: 30, left: -35, opacity: 0.13 },
      ].map((c, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: c.size,
            height: c.size,
            borderRadius: '50%',
            background: '#ffffff',
            opacity: c.opacity,
            top: c.top,
            left: c.left,
            right: c.right,
            bottom: c.bottom,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Title */}
      <div style={{ textAlign: 'center', position: 'relative' }}>
        <h1
          style={{
            fontFamily: "'BoutiqueBitmap', sans-serif",
            fontWeight: 900,
            fontSize: 72,
            letterSpacing: 8,
            margin: 0,
            color: '#ffffff',
            textShadow: OUTLINE_LG,
            lineHeight: 1,
          }}
        >
          LETTRIS
        </h1>
        <p
          style={{
            fontFamily: "'BoutiqueBitmap', sans-serif",
            color: '#fff8cc',
            fontSize: 14,
            letterSpacing: 4,
            margin: '10px 0 0',
            textShadow: OUTLINE_SM,
          }}
        >
          WORD × TETRIS
        </p>
      </div>

      {/* Instructions card */}
      <div
        style={{
          background: 'linear-gradient(180deg, #8eccc0 0%, #66aaaa 100%)',
          border: '2px solid #4a8a88',
          borderRadius: 16,
          boxShadow: '0 5px 0 #4a8a88, inset 0 2px 0 rgba(255,255,255,0.3)',
          padding: '18px 28px',
          maxWidth: 380,
          width: '88%',
        }}
      >
        <h3
          style={{
            fontFamily: "'BoutiqueBitmap', sans-serif",
            color: '#ffffff',
            fontSize: 13,
            letterSpacing: 2,
            marginTop: 0,
            marginBottom: 12,
            textAlign: 'center',
            textShadow: OUTLINE_SM,
          }}
        >
          HOW TO PLAY
        </h3>
        <ul
          style={{
            fontFamily: "'BoutiqueBitmap', sans-serif",
            color: '#ffffff',
            fontSize: 11,
            lineHeight: 2,
            paddingLeft: 18,
            margin: 0,
            textShadow: OUTLINE_SM,
          }}
        >
          <li>Letters fall from the top of the grid</li>
          <li>← → to move &nbsp;|&nbsp; ↓ to speed up</li>
          <li>SPACE to hard-drop the letter instantly</li>
          <li>Type a word (3+ letters) and press ENTER</li>
          <li>Chain words fast for COMBO multipliers!</li>
          <li>Don't let a column fill to the top</li>
          <li>ESC to pause / resume</li>
        </ul>
      </div>

      {/* Start button */}
      <button
        onClick={onStart}
        onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = '0 1px 0 #448844'; }}
        onMouseUp={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 5px 0 #448844'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 5px 0 #448844'; }}
        style={{
          fontFamily: "'BoutiqueBitmap', sans-serif",
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: 4,
          padding: '13px 50px',
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
        START GAME
      </button>
    </div>
  );
}

export default StartScreen;
