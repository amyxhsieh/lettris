import { useState, useEffect, useCallback } from 'react';
import PixelBackground from './PixelBackground';
import NameEntry from './NameEntry';
import Leaderboard from './Leaderboard';
import { getUsername, saveUsername, clearUsername, getDifficulty, saveDifficulty, getChallenge, saveChallenge, scoresFor } from '../utils/storage';
import { clickSound } from '../utils/sound';
import { RULES, MODE_COLOR, CHALLENGE_COLOR } from '../utils/dictionary';


const CONTROLS = [
  ['← →', 'Move'],
  ['↓', 'Speed up'],
  ['SPACE', 'Hard drop'],
  ['A–Z', 'Type a word'],
  ['ENTER', 'Clear it'],
  ['ESC', 'Pause'],
];

const MODE_MARK = {
  survival: 'SRV',
  words: '30W',
  timed: '3MN',
};

function PixelIcon({ cells, color, accent, accentCells = [], viewBox }) {
  return (
    <svg width="28" height="28" viewBox={viewBox} preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{ display: 'block', imageRendering: 'pixelated' }}>
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={color} />
      ))}
      {accentCells.map(([x, y]) => (
        <rect key={`a-${x}-${y}`} x={x} y={y} width="1" height="1" fill={accent} />
      ))}
    </svg>
  );
}

const BOOK = [
  [3, 3], [4, 3], [5, 3], [6, 3], [9, 3], [10, 3], [11, 3], [12, 3],
  [3, 4], [4, 4], [5, 4], [6, 4], [9, 4], [10, 4], [12, 4],
  [3, 5], [4, 5], [5, 5], [6, 5], [9, 5], [10, 5], [11, 5], [12, 5],
  [3, 6], [4, 6], [5, 6], [6, 6], [9, 6], [10, 6], [11, 6], [12, 6],
  [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7], [11, 7], [12, 7],
  [4, 8], [5, 8], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8], [11, 8],
  [7, 3], [8, 3], [7, 4], [8, 4], [7, 5], [8, 5], [7, 6], [8, 6],
];

const BOOK_MARK = [[11, 1], [11, 2], [10, 3], [11, 3], [12, 3], [11, 4]];

const TROPHY = [
  [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3],
  [3, 4], [5, 4], [6, 4], [7, 4], [8, 4], [9, 4], [10, 4], [12, 4],
  [3, 5], [6, 5], [7, 5], [8, 5], [9, 5], [12, 5],
  [6, 6], [7, 6], [8, 6], [9, 6],
  [7, 7], [8, 7],
  [6, 8], [7, 8], [8, 8], [9, 8],
  [5, 9], [6, 9], [7, 9], [8, 9], [9, 9], [10, 9],
  [4, 10], [5, 10], [6, 10], [7, 10], [8, 10], [9, 10], [10, 10], [11, 10],
];

const TROPHY_STAR = [[7, 0], [6, 1], [7, 1], [8, 1], [7, 2]];

function ModeList({ order, selected, cursor, onChange, locked }) {
  return (
    <div
      className="mode-list"
      data-locked={locked ? 'true' : 'false'}
      role="radiogroup"
      aria-label="Mode"
      style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}
    >
      {order.map((id) => {
        const spec = RULES.challenges[id];
        const active = id === selected;
        const focused = !active && id === cursor;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            className="mode-card"
            data-on={active ? 'true' : 'false'}
            data-cursor={focused ? 'true' : 'false'}
            style={{ '--mode': CHALLENGE_COLOR[id] }}
            onClick={() => onChange(id)}
          >
            <span className="mode-card-code">{MODE_MARK[id]}</span>
            <span>
              <span className="mode-card-name">{spec.label}</span>
              <span className="mode-card-tag">{spec.tagline}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ChoiceRow({ label, order, selected, cursor, colors, specs, onChange }) {
  const preview = selected || cursor;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div
        style={{
          fontFamily: "'BoutiqueBitmap', sans-serif",
          fontSize: 10,
          letterSpacing: 3,
          color: 'rgba(255,255,255,0.35)',
        }}
      >
        {label}
      </div>
      <div role="radiogroup" aria-label={label} style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12 }}>
        {order.map((id) => {
          const spec = specs[id];
          const active = id === selected;
          const focused = !active && id === cursor;
          const color = colors[id];
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              className="pressable"
              onClick={() => onChange(id)}
              style={{
                fontFamily: "'BoutiqueBitmap', sans-serif",
                fontSize: 13,
                letterSpacing: 2,
                padding: '10px 16px',
                background: active ? `${color}18` : 'transparent',
                border: `2px solid ${active ? color : focused ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)'}`,
                borderRadius: 4,
                color: active ? color : focused ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer',
                textShadow: active ? `0 0 8px ${color}` : 'none',
                boxShadow: active ? `0 0 10px ${color}44` : 'none',
              }}
            >
              {spec.label}
            </button>
          );
        })}
      </div>
      {preview && (
        <div
          style={{
            fontFamily: "'BoutiqueBitmap', sans-serif",
            fontSize: 11,
            letterSpacing: 1,
            lineHeight: 1.6,
            color: 'rgba(255,255,255,0.45)',
            textAlign: 'center',
            maxWidth: 360,
          }}
        >
          {specs[preview].tagline}
        </div>
      )}
    </div>
  );
}

function StartScreen({ onStart }) {
  const [username, setUsername] = useState(() => getUsername());
  const [blink, setBlink] = useState(true);
  const [panel, setPanel] = useState(null);
  const [difficulty, setDifficulty] = useState(() => getDifficulty());
  const [challenge, setChallenge] = useState(() => getChallenge());
  const [modeChosen, setModeChosen] = useState(false);
  const [difficultyChosen, setDifficultyChosen] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => setBlink((b) => !b), 1100);
    return () => clearInterval(id);
  }, []);

  const moveChallenge = useCallback((id) => {
    if (!RULES.challenges[id] || id === challenge) return;
    clickSound();
    saveChallenge(id);
    setChallenge(id);
  }, [challenge]);

  const confirmMode = useCallback((id) => {
    if (!RULES.challenges[id]) return;
    if (modeChosen && id === challenge) return;
    if (id !== challenge) {
      clickSound();
      saveChallenge(id);
      setChallenge(id);
    } else {
      clickSound();
    }
    setModeChosen(true);
  }, [challenge, modeChosen]);

  const moveDifficulty = useCallback((id) => {
    if (!RULES.difficulties[id] || id === difficulty) return;
    clickSound();
    saveDifficulty(id);
    setDifficulty(id);
  }, [difficulty]);

  const confirmDifficulty = useCallback((id) => {
    if (!RULES.difficulties[id]) return;
    if (difficultyChosen && id === difficulty) return;
    if (id !== difficulty) {
      clickSound();
      saveDifficulty(id);
      setDifficulty(id);
    } else {
      clickSound();
    }
    setDifficultyChosen(true);
  }, [difficulty, difficultyChosen]);

  useEffect(() => {
    if (!username) return undefined;
    const handleKeyDown = (e) => {
      const arrows = e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown';
      if (panel) {
        if (arrows || e.key === 'Escape') e.preventDefault();
        if (e.key === 'Escape') setPanel(null);
        return;
      }
      if (arrows) e.preventDefault();
      if (e.repeat) return;

      const moveMode = (step) => {
        const order = RULES.challengeOrder;
        const index = Math.max(0, order.indexOf(challenge));
        moveChallenge(order[(index + step + order.length) % order.length]);
      };
      const moveLevel = (step) => {
        const order = RULES.order;
        const index = Math.max(0, order.indexOf(difficulty));
        moveDifficulty(order[(index + step + order.length) % order.length]);
      };

      if (!modeChosen) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') moveMode(1);
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') moveMode(-1);
        if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) confirmMode(challenge);
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        moveMode(e.key === 'ArrowDown' ? 1 : -1);
        return;
      }

      if (!difficultyChosen) {
        if (e.key === 'ArrowRight') moveLevel(1);
        if (e.key === 'ArrowLeft') moveLevel(-1);
        if (e.key === '1' || e.key === '2' || e.key === '3') confirmDifficulty(RULES.order[Number(e.key) - 1]);
        if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) confirmDifficulty(difficulty);
        return;
      }

      if (e.key === 'ArrowRight') moveLevel(1);
      if (e.key === 'ArrowLeft') moveLevel(-1);
      if (e.key === '1' || e.key === '2' || e.key === '3') moveDifficulty(RULES.order[Number(e.key) - 1]);
      if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) onStart(difficulty, challenge);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    username,
    onStart,
    difficulty,
    challenge,
    modeChosen,
    difficultyChosen,
    panel,
    moveChallenge,
    confirmMode,
    moveDifficulty,
    confirmDifficulty,
  ]);

  useEffect(() => {
    if (!panel) return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      setPanel(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [panel]);

  const openPanel = (next) => {
    clickSound();
    setPanel(next);
  };

  const closePanel = () => setPanel(null);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'linear-gradient(180deg, #03030e 0%, #07091e 25%, #090e38 55%, #0e1458 80%, #141870 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'safe center',
        zIndex: 100,
        gap: 48,
        overflowY: 'auto',
        padding: '48px 24px 40px',
      }}
    >
      <PixelBackground shootingStars />

      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 3, display: 'flex', gap: 10 }}>
        <button
          type="button"
          className="corner-icon"
          data-on={panel === 'how' ? 'true' : 'false'}
          style={{ '--ink': '#7ee8ff' }}
          aria-label="How to play"
          onClick={() => openPanel('how')}
        >
          <PixelIcon cells={BOOK} color="#9aefff" accent="#ff8ad4" accentCells={BOOK_MARK} viewBox="3 1 10 8" />
        </button>
        <button
          type="button"
          className="corner-icon"
          data-on={panel === 'board' ? 'true' : 'false'}
          style={{ '--ink': '#ffd56a' }}
          aria-label="Leaderboard"
          onClick={() => openPanel('board')}
        >
          <PixelIcon cells={TROPHY} color="#ffd56a" accent="#fff6c8" accentCells={TROPHY_STAR} viewBox="3 0 10 11" />
        </button>
      </div>

      {/* All content sits above PixelBackground in the stacking order */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48, width: '100%', maxWidth: 560 }}>

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

      {/* Name entry or greeting + PRESS START */}
      {!username ? (
        <NameEntry
          onDone={(name) => {
            saveUsername(name);
            setUsername(name);
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
          <div
            style={{
              fontFamily: "'BoutiqueBitmap', sans-serif",
              color: 'rgba(255,255,255,0.55)',
              fontSize: 13,
              letterSpacing: 3,
            }}
          >
            HEY, {username.toUpperCase()}!
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 22, width: 'min(520px, 100%)' }}>
            <ModeList
              order={RULES.challengeOrder}
              selected={modeChosen ? challenge : null}
              cursor={modeChosen ? null : challenge}
              locked={modeChosen}
              onChange={confirmMode}
            />
            {modeChosen && (
              <div className="menu-step">
                <ChoiceRow
                  label="DIFFICULTY"
                  order={RULES.order}
                  selected={difficultyChosen ? difficulty : null}
                  cursor={difficultyChosen ? null : difficulty}
                  colors={MODE_COLOR}
                  specs={RULES.difficulties}
                  onChange={confirmDifficulty}
                />
              </div>
            )}
            <div
              style={{
                fontFamily: "'BoutiqueBitmap', sans-serif",
                fontSize: 10,
                letterSpacing: 2,
                textAlign: 'center',
                color: 'rgba(255,255,255,0.28)',
              }}
            >
              {!modeChosen && '← → · ENTER'}
              {modeChosen && !difficultyChosen && '← → · 1 2 3 · ENTER'}
              {difficultyChosen && '↑ ↓ MODE · ← → LEVEL'}
            </div>
          </div>

          {difficultyChosen && (
            <div className="menu-step" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8 }}>
              <div
                className="pressable"
                style={{
                  fontFamily: "'BoutiqueBitmap', sans-serif",
                  fontWeight: 700,
                  fontSize: 22,
                  letterSpacing: 5,
                  color: '#ddccff',
                  textShadow: '0 0 10px #ddccff, 0 0 30px rgba(221,204,255,0.4)',
                  opacity: blink ? 1 : 0.45,
                  transition: 'opacity 280ms cubic-bezier(0.23, 1, 0.32, 1), transform 160ms cubic-bezier(0.23, 1, 0.32, 1)',
                  cursor: 'pointer',
                }}
                role="button"
                tabIndex={0}
                onClick={() => { clickSound(); onStart(difficulty, challenge); }}
              >
                START GAME
              </div>
            </div>
          )}

          <button
            className="pressable"
            onClick={() => {
              clickSound();
              clearUsername();
              setUsername('');
              setModeChosen(false);
              setDifficultyChosen(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.28)',
              fontFamily: "'BoutiqueBitmap', sans-serif",
              fontSize: 10,
              letterSpacing: 2,
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            not you?
          </button>
        </div>
      )}

      </div>{/* end content wrapper */}

      {panel && (
        <div
          className="home-modal-backdrop"
          onClick={closePanel}
        >
          <div
            className="home-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-panel-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
              <h2
                id="home-panel-title"
                style={{
                  margin: 0,
                  fontFamily: "'BoutiqueBitmap', sans-serif",
                  fontSize: 16,
                  letterSpacing: 3,
                  color: panel === 'how' ? '#7ee8ff' : '#ffd56a',
                }}
              >
                {panel === 'how' ? 'HOW TO PLAY' : 'LEADERBOARD'}
              </h2>
              <button
                type="button"
                className="pressable"
                aria-label="Close"
                onClick={() => { clickSound(); closePanel(); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.45)',
                  fontFamily: "'BoutiqueBitmap', sans-serif",
                  fontSize: 14,
                  cursor: 'pointer',
                  padding: '4px 6px',
                }}
              >
                ✕
              </button>
            </div>

            {panel === 'how' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <p
                  style={{
                    fontFamily: "'BoutiqueBitmap', sans-serif",
                    color: 'rgba(255,255,255,0.62)',
                    fontSize: 12,
                    lineHeight: 1.7,
                    letterSpacing: 0.4,
                    margin: 0,
                  }}
                >
                  <span style={{ color: '#00eeff' }}>Cyan</span> vowels, <span style={{ color: '#44ff88' }}>green</span> consonants.
                  Easy and Medium clear from 3 letters. Hard clears from 4.
                  Chain words quickly for a combo.
                  Survival fills the board. 30 Words is a race. 3 Minutes ends at 0:00.
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '10px 24px',
                  }}
                >
                  {CONTROLS.map(([key, action]) => (
                    <div
                      key={key}
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 12,
                        fontFamily: "'BoutiqueBitmap', sans-serif",
                        fontSize: 13,
                      }}
                    >
                      <span style={{ color: '#7ee8ff', letterSpacing: 1, minWidth: 64 }}>{key}</span>
                      <span style={{ color: 'rgba(255,255,255,0.78)' }}>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {panel === 'board' && (
              <div>
                <p
                  style={{
                    margin: '0 0 12px',
                    textAlign: 'center',
                    fontFamily: "'BoutiqueBitmap', sans-serif",
                    fontSize: 11,
                    letterSpacing: 2,
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  {RULES.challenges[challenge].label} · {RULES.difficulties[difficulty].label}
                </p>
                <Leaderboard
                  scores={scoresFor(difficulty, challenge)}
                  currentName={username}
                  rankBy={RULES.challenges[challenge].rankBy}
                  emptyLabel={challenge === 'words'
                    ? `NO ${RULES.difficulties[difficulty].label} CLEARS YET`
                    : `NO ${RULES.difficulties[difficulty].label} RECORDS YET`}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StartScreen;
