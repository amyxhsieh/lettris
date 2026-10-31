import { useState, useEffect, useCallback, useRef } from 'react';
import PixelBackground from './PixelBackground';
import NameEntry from './NameEntry';
import Leaderboard from './Leaderboard';
import DailyWord from './DailyWord';
import { getUsername, saveUsername, clearUsername, getDifficulty, saveDifficulty, getChallenge, saveChallenge, scoresFor } from '../utils/storage';
import { fetchLeaderboard, fetchStats } from '../utils/remote';
import { clickSound, playPageMusic } from '../utils/sound';
import { RULES, MODE_COLOR, CHALLENGE_COLOR, todayDaily } from '../utils/dictionary';


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
  words: '50W',
  timed: '3MN',
  daily: 'DAY',
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

const QUESTION = [
  [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0],
  [4, 1], [5, 1], [10, 1], [11, 1],
  [4, 2], [5, 2], [10, 2], [11, 2],
  [10, 3], [11, 3],
  [8, 4], [9, 4], [10, 4],
  [7, 5], [8, 5],
  [7, 6], [8, 6],
  [7, 8], [8, 8],
  [7, 9], [8, 9],
];

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

const PAGES = {
  legal: {
    title: 'TERMS & PRIVACY',
    updated: 'October 30, 2026',
    intro: 'This page is the terms of use and the privacy policy. Playing means you have read it.',
    sections: [
      {
        heading: '1. No account',
        body: 'Lettris is free in the browser. You pick a name and play. There is no sign-up, no password, and no email.',
      },
      {
        heading: '2. Your name',
        body: 'The name is public. It shows on the leaderboard with your score, the level, and the game type. This browser also keeps a random id, so two people with the same name stay two players.',
      },
      {
        heading: '3. A finished game',
        body: 'When a run ends, the board saves your name, score, words, level, difficulty, game type, and time. Quit does not save a run. A 50 Words run that stops before 50 words counts as a game played, and it does not rank.',
      },
      {
        heading: '4. This browser',
        body: 'The name and the id stay on this computer, in this browser. “not you?” clears the name here. Runs already on the board stay on the board.',
      },
      {
        heading: '5. Visits',
        body: 'Vercel Analytics counts visits to the site. That count is not tied to your name.',
      },
      {
        heading: '6. The board',
        body: 'A score stays as the run left it. It comes off only when it breaks the rules.',
      },
      {
        heading: '7. Changes',
        body: 'The game can change, and so can this page. The version on this screen is the current one.',
      },
    ],
  },
  rules: {
    title: 'RULES',
    updated: 'October 30, 2026',
    intro: 'These rules keep the board honest. How the pieces fall is under the question mark.',
    sections: [
      {
        heading: '1. Be one player',
        body: 'This browser is your seat. Don’t stack extra ids so the ranks are full of you, and don’t post a finished run under someone else’s name.',
      },
      {
        heading: '2. Clear the words yourself',
        body: 'The score comes from words you clear in the game. No bots, no macros, no solvers, and no scores sent from outside.',
      },
      {
        heading: '3. The name is public',
        body: 'Pick a name you are fine leaving on the board. Don’t pretend to be someone else. Don’t put hate, or a private detail, in the name.',
      },
      {
        heading: '4. A run is a real run',
        body: 'Play the mode you started. Don’t dump empty games just to push the counts around.',
      },
      {
        heading: '5. If a run breaks this',
        body: 'That run can come off the board. A name that keeps breaking the rules can be left off later boards.',
      },
    ],
  },
};

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

function ChoiceRow({ label, order, selected, cursor, colors, specs, onChange, lockedId = null }) {
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
          const lockedOut = Boolean(lockedId) && id !== lockedId;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-disabled={lockedOut}
              className="pressable"
              onClick={() => { if (!lockedOut) onChange(id); }}
              style={{
                fontFamily: "'BoutiqueBitmap', sans-serif",
                fontSize: 13,
                letterSpacing: 2,
                padding: '10px 16px',
                background: active ? `${color}18` : 'transparent',
                border: `2px solid ${active ? color : focused ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)'}`,
                borderRadius: 4,
                color: active ? color : focused ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.45)',
                cursor: lockedOut ? 'default' : 'pointer',
                opacity: lockedOut ? 0.35 : 1,
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

function formatCount(value) {
  return String(Math.max(0, Math.floor(Number(value) || 0))).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function HomeTotals({ stats }) {
  return (
    <footer
      aria-label="Players and games"
      style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 'clamp(28px, 8vw, 88px)',
        flexShrink: 0,
        padding: '12px 24px 8px',
        visibility: stats ? 'visible' : 'hidden',
      }}
    >
      {[
        [stats?.players, 'TOTAL PLAYERS'],
        [stats?.games, 'GAMES PLAYED'],
      ].map(([value, label]) => (
        <div key={label} style={{ textAlign: 'center', minWidth: 120 }}>
          <div
            style={{
              fontFamily: "'BoutiqueBitmap', sans-serif",
              fontSize: 'clamp(26px, 4vw, 36px)',
              lineHeight: 1,
              color: 'rgba(186, 186, 186, 0.82)',
            }}
          >
            {formatCount(value)}
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: "'BoutiqueBitmap', sans-serif",
              fontSize: 11,
              letterSpacing: 2,
              color: 'rgba(160, 160, 160, 0.55)',
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </footer>
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
  const [totals, setTotals] = useState(null);
  const [boardScores, setBoardScores] = useState([]);
  const [boardStatus, setBoardStatus] = useState('idle');
  const [boardChallenge, setBoardChallenge] = useState(() => getChallenge());
  const dailyPanelRef = useRef(null);

  useEffect(() => {
    playPageMusic();
  }, []);

  useEffect(() => {
    if (challenge !== 'daily' || !difficultyChosen) return;
    dailyPanelRef.current?.scrollIntoView({ block: 'center', inline: 'nearest' });
  }, [challenge, difficultyChosen]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => setBlink((b) => !b), 1100);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancel = false;
    fetchStats()
      .then((stats) => { if (!cancel) setTotals(stats); })
      .catch(() => {});
    return () => { cancel = true; };
  }, []);

  useEffect(() => {
    if (panel !== 'board') return undefined;
    let cancel = false;
    fetchLeaderboard(boardChallenge)
      .then((scores) => {
        if (cancel) return;
        setBoardScores(scores);
        setBoardStatus('ready');
      })
      .catch(() => {
        if (cancel) return;
        setBoardScores(scoresFor(boardChallenge));
        setBoardStatus('local');
      });
    return () => { cancel = true; };
  }, [panel, boardChallenge]);

  const applyLockedDifficulty = useCallback((id, chosen) => {
    const locked = RULES.challenges[id]?.lockedDifficulty;
    if (!locked) return;
    setDifficulty(locked);
    if (chosen) setDifficultyChosen(true);
  }, []);

  const moveChallenge = useCallback((id) => {
    if (!RULES.challenges[id] || id === challenge) return;
    clickSound();
    saveChallenge(id);
    setChallenge(id);
    applyLockedDifficulty(id, modeChosen);
  }, [challenge, modeChosen, applyLockedDifficulty]);

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
    applyLockedDifficulty(id, true);
  }, [challenge, modeChosen, applyLockedDifficulty]);

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
        if (e.repeat) return;
        if (e.key === 'Escape') setPanel(null);
        if (panel === 'board' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          const order = RULES.challengeOrder;
          const index = Math.max(0, order.indexOf(boardChallenge));
          const step = e.key === 'ArrowRight' ? 1 : -1;
          const next = order[(index + step + order.length) % order.length];
          clickSound();
          setBoardStatus('loading');
          setBoardChallenge(next);
        }
        return;
      }
      if (arrows) e.preventDefault();
      if (e.repeat) return;

      const moveMode = (step) => {
        const order = RULES.challengeOrder;
        const index = Math.max(0, order.indexOf(challenge));
        moveChallenge(order[(index + step + order.length) % order.length]);
      };
      const lockedDifficulty = RULES.challenges[challenge]?.lockedDifficulty;
      const moveLevel = (step) => {
        if (lockedDifficulty) return;
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
        if (!lockedDifficulty && (e.key === '1' || e.key === '2' || e.key === '3')) confirmDifficulty(RULES.order[Number(e.key) - 1]);
        if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) confirmDifficulty(difficulty);
        return;
      }

      if (e.key === 'ArrowRight') moveLevel(1);
      if (e.key === 'ArrowLeft') moveLevel(-1);
      if (!lockedDifficulty && (e.key === '1' || e.key === '2' || e.key === '3')) moveDifficulty(RULES.order[Number(e.key) - 1]);
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
    boardChallenge,
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
    if (next === 'board') {
      setBoardChallenge(challenge);
      setBoardStatus('loading');
    }
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
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      <PixelBackground shootingStars />

      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 3, display: 'flex', gap: 10 }}>
        <button
          type="button"
          className="corner-icon"
          data-on={panel === 'board' ? 'true' : 'false'}
          style={{ '--ink': '#7ee8ff' }}
          aria-label="Leaderboard"
          onClick={() => openPanel('board')}
        >
          <PixelIcon cells={TROPHY} color="#ffd56a" accent="#fff6c8" accentCells={TROPHY_STAR} viewBox="3 0 10 11" />
        </button>
        <button
          type="button"
          className="corner-icon"
          data-on={panel === 'how' ? 'true' : 'false'}
          style={{ '--ink': '#7ee8ff' }}
          aria-label="How to play"
          onClick={() => openPanel('how')}
        >
          <PixelIcon cells={QUESTION} color="#9aefff" viewBox="4 0 8 10" />
        </button>
      </div>

      <div
        className="pixel-scroll"
        style={{
          '--ink': '#7ee8ff',
          position: 'relative',
          zIndex: 1,
          flex: 1,
          minHeight: 0,
          width: '100%',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
      <div
        style={{
          flex: '1 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'safe center',
          padding: '48px 24px 24px',
          width: '100%',
        }}
      >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 48, width: '100%', maxWidth: 560 }}>

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
                  lockedId={RULES.challenges[challenge]?.lockedDifficulty || null}
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
              {difficultyChosen && challenge !== 'daily' && '↑ ↓ MODE · ← → LEVEL'}
            </div>
          </div>

          {difficultyChosen && challenge === 'daily' && (
            <div ref={dailyPanelRef} className="menu-step" style={{ width: 'min(520px, 100%)' }}>
              <DailyWord word={todayDaily().word} />
            </div>
          )}

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

      </div>
      </div>

      <HomeTotals stats={totals} />
      </div>

      <nav className="site-footer" aria-label="Lettris">
        <p className="site-footer-credit">@LETTRIS 2026</p>
        <div className="site-footer-links">
          <button type="button" className="site-link pressable" onClick={() => openPanel('legal')}>
            Terms of use / Privacy policy
          </button>
          <button type="button" className="site-link pressable" onClick={() => openPanel('rules')}>
            Rules
          </button>
        </div>
      </nav>

      {panel && (
        <div
          className="home-modal-backdrop"
          onClick={closePanel}
        >
          <div
            className="home-modal pixel-scroll"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-panel-title"
            style={{ '--ink': '#7ee8ff' }}
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
                  color: '#7ee8ff',
                }}
              >
                {PAGES[panel]?.title || (panel === 'how' ? 'HOW TO PLAY' : 'LEADERBOARD')}
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

            {PAGES[panel] && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p
                  style={{
                    fontFamily: "'BoutiqueBitmap', sans-serif",
                    color: 'rgba(255,255,255,0.38)',
                    fontSize: 11,
                    letterSpacing: 0.6,
                    margin: 0,
                  }}
                >
                  Updated {PAGES[panel].updated}
                </p>
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
                  {PAGES[panel].intro}
                </p>
                {PAGES[panel].sections.map((section) => (
                  <div key={section.heading}>
                    <h3
                      style={{
                        margin: '0 0 6px',
                        fontFamily: "'BoutiqueBitmap', sans-serif",
                        fontSize: 12,
                        fontWeight: 400,
                        letterSpacing: 1,
                        color: '#7ee8ff',
                      }}
                    >
                      {section.heading}
                    </h3>
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
                      {section.body}
                    </p>
                  </div>
                ))}
              </div>
            )}

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
                  After a clear, the next letters lean toward a different word.
                  Survival fills the board. 50 Words is 50 clears. 3 Minutes ends at 0:00.
                  Daily is today's 4-letter word on Medium, with the same letters for everyone. Clear that word the most times. Other words still clear.
                  Easy scores ×1, Medium ×2, Hard ×3.
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
                <div className="board-tabs" role="tablist" aria-label="Game type">
                  {RULES.challengeOrder.map((id) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      className="board-tab"
                      aria-selected={boardChallenge === id}
                      style={{ '--ink': CHALLENGE_COLOR[id] }}
                      onClick={() => {
                        if (id === boardChallenge) return;
                        clickSound();
                        setBoardStatus('loading');
                        setBoardChallenge(id);
                      }}
                    >
                      <span className="board-tab-label">{RULES.challenges[id].label}</span>
                    </button>
                  ))}
                </div>
                {boardChallenge === 'daily' && (
                  <div style={{ marginBottom: 14 }}>
                    <DailyWord word={todayDaily().word} layout="board" />
                  </div>
                )}
                <Leaderboard
                  scores={boardStatus === 'loading' ? [] : boardScores}
                  currentName={username}
                  rankBy={RULES.challenges[boardChallenge].rankBy}
                  emptyLabel={boardStatus === 'loading'
                    ? 'LOADING'
                    : boardChallenge === 'words' || boardChallenge === 'daily'
                      ? 'NO CLEARS YET'
                      : 'NO RECORDS YET'}
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
