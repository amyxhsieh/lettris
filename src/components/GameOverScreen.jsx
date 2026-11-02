import { clickSound } from '../utils/sound';
import { engine, MODE_COLOR, CHALLENGE_COLOR } from '../utils/dictionary';
import { formatClock, formatRemaining } from '../utils/time';

function overview({ challenge, reason, wordsFound, score, level, difficulty, timeMs, dailyWord = '' }) {
  const mode = engine.difficulty(difficulty);
  const spec = engine.challenge(challenge);
  const difficultyRow = { label: 'DIFFICULTY', value: mode.label, color: MODE_COLOR[difficulty] };
  const scoreRow = { label: 'FINAL SCORE', value: score.toLocaleString(), color: '#33ff66' };

  if (spec.goal === 'words' && reason === 'target') {
    return {
      title: 'CLEARED',
      titleColor: CHALLENGE_COLOR.words,
      subtitle: spec.label,
      rows: [
        { label: 'TIME', value: formatClock(timeMs), color: '#33ff66' },
        scoreRow,
        difficultyRow,
      ],
    };
  }

  if (spec.goal === 'words') {
    return {
      title: 'GAME OVER',
      titleColor: '#ff4466',
      subtitle: `${wordsFound}/${spec.targetWords}`,
      rows: [
        { label: 'TIME', value: formatClock(timeMs), color: '#00ccee' },
        scoreRow,
        difficultyRow,
      ],
    };
  }

  if (spec.goal === 'daily') {
    return {
      title: reason === 'time' ? 'TIME UP' : 'GAME OVER',
      titleColor: reason === 'time' ? CHALLENGE_COLOR.daily : '#ff4466',
      subtitle: dailyWord.toUpperCase(),
      rows: [
        { label: 'COLLECTS', value: wordsFound, color: CHALLENGE_COLOR.daily },
        scoreRow,
      ],
    };
  }

  if (spec.goal === 'time' && reason === 'time') {
    return {
      title: 'TIME UP',
      titleColor: CHALLENGE_COLOR.timed,
      subtitle: formatClock(spec.limitMs),
      rows: [
        scoreRow,
        { label: 'WORDS FOUND', value: wordsFound, color: '#00ccee' },
        difficultyRow,
      ],
    };
  }

  if (spec.goal === 'time') {
    return {
      title: 'GAME OVER',
      titleColor: '#ff4466',
      subtitle: 'BOARD FILLED',
      rows: [
        scoreRow,
        { label: 'TIME LEFT', value: formatRemaining(Math.max(0, spec.limitMs - timeMs)), color: '#ffaa44' },
        { label: 'WORDS FOUND', value: wordsFound, color: '#00ccee' },
        difficultyRow,
      ],
    };
  }

  return {
    title: 'GAME OVER',
    titleColor: '#ff4466',
    subtitle: 'COLUMN OVERFLOW',
      rows: [
      scoreRow,
      ...(spec.hideDifficulty ? [] : [difficultyRow]),
      { label: 'WORDS FOUND', value: wordsFound, color: '#00ccee' },
      { label: 'LEVEL REACHED', value: level, color: '#00ccee' },
    ],
  };
}

function GameOverScreen({
  score,
  wordsFound,
  level,
  difficulty = 'medium',
  challenge = 'survival',
  timeMs = 0,
  reason = 'topout',
  dailyWord = '',
  onPlayAgain,
  onQuit,
  playerName,
  rank = null,
}) {
  const board = overview({ challenge, reason, wordsFound, score, level, difficulty, timeMs, dailyWord });

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
          borderRadius: 4,
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
            color: board.titleColor,
            margin: '0 0 4px',
            textShadow: `0 0 12px ${board.titleColor}, 0 0 40px ${board.titleColor}55`,
          }}
        >
          {board.title}
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
          {board.subtitle}
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
          {board.rows.map(({ label, value, color }) => (
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
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(51,255,102,0.12)'; e.currentTarget.style.boxShadow = '0 0 16px color-mix(in srgb, #33ff66 28%, transparent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = '0 0 14px color-mix(in srgb, #33ff66 18%, transparent)'; }}
            style={{
              fontFamily: "'BoutiqueBitmap', sans-serif",
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: 4,
              padding: '12px 40px',
              background: 'transparent',
              border: '1px solid color-mix(in srgb, #33ff66 46%, transparent)',
              borderRadius: 4,
              color: '#33ff66',
              cursor: 'pointer',
              boxShadow: '0 0 14px color-mix(in srgb, #33ff66 18%, transparent)',
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
