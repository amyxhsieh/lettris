import { formatClock } from '../utils/time';
import { MODE_COLOR } from '../utils/dictionary';

function Leaderboard({ scores, currentName, emptyLabel = 'NO RECORDS YET', rankBy = 'score', showDifficulty = true }) {
  if (!scores || scores.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          fontFamily: "'BoutiqueBitmap', sans-serif",
          color: 'rgba(255,255,255,0.3)',
          fontSize: 11,
          letterSpacing: 3,
          padding: '16px 0',
        }}
      >
        {emptyLabel}
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {scores.map((entry, idx) => {
        const isCurrentUser = entry.name.toUpperCase() === currentName.toUpperCase();
        return (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '2px 6px',
              background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
              fontFamily: "'BoutiqueBitmap', sans-serif",
              fontSize: 11,
              lineHeight: 1.8,
            }}
          >
            <span
              style={{
                color: 'rgba(255,255,255,0.4)',
                width: 28,
                flexShrink: 0,
              }}
            >
              #{idx + 1}
            </span>
            <span
              style={{
                color: isCurrentUser ? '#00eeff' : 'rgba(255,255,255,0.8)',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textShadow: isCurrentUser ? '0 0 6px #00eeff88' : 'none',
              }}
            >
              {entry.name.toUpperCase()}
            </span>
            {showDifficulty && MODE_COLOR[entry.difficulty] && (
              <span
                style={{
                  color: MODE_COLOR[entry.difficulty],
                  fontSize: 9,
                  letterSpacing: 1,
                  flexShrink: 0,
                }}
              >
                {entry.difficulty === 'medium' ? 'MED' : entry.difficulty === 'hard' ? 'HARD' : 'EASY'}
              </span>
            )}
            <span
              style={{
                color: '#33ff66',
                flexShrink: 0,
              }}
            >
              {rankBy === 'time'
                ? formatClock(entry.timeMs || 0)
                : rankBy === 'collects'
                  ? entry.words
                  : entry.score.toLocaleString()}
            </span>
            <span
              style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: 9,
                flexShrink: 0,
              }}
            >
              {rankBy === 'scoreTime'
                ? formatClock(entry.timeMs || 0)
                : rankBy === 'time' || rankBy === 'collects'
                  ? entry.score.toLocaleString()
                  : `${entry.words}w`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default Leaderboard;
