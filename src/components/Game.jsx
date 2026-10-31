import {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import Grid from './Grid';
import StatsBar from './StatsBar';
import InputBar from './InputBar';
import StartScreen from './StartScreen';
import GameOverScreen from './GameOverScreen';
import PixelBackground from './PixelBackground';
import { getLetterColor } from '../utils/letters';
import { RULES, engine, MODE_COLOR, CHALLENGE_COLOR } from '../utils/dictionary';
import { useKeyboard } from '../hooks/useKeyboard';
import { useBoardScale } from '../hooks/useBoardScale';
import { getUsername, guestName, getDifficulty, getChallenge, saveScore, scoresFor } from '../utils/storage';
import { loadLeaderboard, submitRun } from '../utils/remote';
import { formatClock, formatRemaining } from '../utils/time';
import { clickSound, playGameMusic, playPageMusic, shuffleGameMusic, pauseMusic, resumeMusic, stopMusic, fadeOutMusic, playSound } from '../utils/sound';
import '../styles/animations.css';

const ROWS = RULES.rows;
const COLS = RULES.cols;

const SHUFFLE_MARK = [
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 7], [5, 6], [6, 5], [7, 4], [8, 3], [9, 2], [10, 2], [11, 2], [12, 2], [13, 2],
  [13, 1], [14, 1], [15, 2], [13, 3], [14, 3],
  [0, 2], [1, 2], [2, 2], [3, 2], [4, 3], [5, 4], [7, 6], [8, 7], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8],
  [13, 7], [14, 7], [15, 8], [13, 9], [14, 9],
];

function ShuffleMark() {
  return (
    <svg width="24" height="15" viewBox="0 0 16 10" aria-hidden="true" style={{ display: 'block', imageRendering: 'pixelated' }}>
      {SHUFFLE_MARK.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
      ))}
    </svg>
  );
}

const QUIT_HOLD_MS = 750;

function QuitButton({ onQuit }) {
  const holdRef = useRef(null);
  const [holding, setHolding] = useState(false);

  const clearHold = useCallback(() => {
    if (holdRef.current) {
      clearTimeout(holdRef.current);
      holdRef.current = null;
    }
    setHolding(false);
  }, []);

  useEffect(() => () => {
    if (holdRef.current) clearTimeout(holdRef.current);
  }, []);

  const begin = useCallback((event) => {
    if (holdRef.current) return;
    if (event.button != null && event.button !== 0) return;
    if (event.currentTarget?.setPointerCapture && event.pointerId != null) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    setHolding(true);
    holdRef.current = setTimeout(() => {
      holdRef.current = null;
      clickSound();
      onQuit();
    }, QUIT_HOLD_MS);
  }, [onQuit]);

  const end = useCallback(() => {
    if (!holdRef.current) return;
    clearHold();
  }, [clearHold]);

  const leave = useCallback((event) => {
    if (!holdRef.current) return;
    const box = event.currentTarget.getBoundingClientRect();
    const inside = event.clientX >= box.left && event.clientX <= box.right
      && event.clientY >= box.top && event.clientY <= box.bottom;
    if (!inside) clearHold();
  }, [clearHold]);

  return (
    <button
      type="button"
      className="corner-chip quit-hold"
      aria-label="Hold to quit"
      data-holding={holding ? 'true' : 'false'}
      onPointerDown={begin}
      onPointerUp={end}
      onPointerMove={leave}
      onPointerCancel={clearHold}
      onContextMenu={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.repeat) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        begin(event);
      }}
      onKeyUp={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        end();
      }}
      onBlur={clearHold}
      style={{
        '--ink': '#00ddff',
        '--quit-hold': `${QUIT_HOLD_MS}ms`,
        position: 'fixed',
        top: 16,
        left: 16,
        zIndex: 50,
      }}
    >
      <span className="quit-hold-fill" aria-hidden="true" />
      <span className="quit-hold-label">← QUIT</span>
    </button>
  );
}

function makeEmptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function Game() {
  const columnRef = useRef(null);
  const board = useBoardScale(columnRef);
  // ── UI state ──────────────────────────────────────────────
  const [started, setStarted] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);
  const [difficulty, setDifficulty] = useState(() => getDifficulty());
  const [challenge, setChallenge] = useState(() => getChallenge());
  const [elapsedMs, setElapsedMs] = useState(0);
  const [runResult, setRunResult] = useState(null);
  const [boardRank, setBoardRank] = useState(null);

  // ── Grid / falling state ──────────────────────────────────
  const [grid, setGrid] = useState(makeEmptyGrid());
  const [falling, setFalling] = useState(null); // {letter, row, col, color}
  const [clearedCells, setClearedCells] = useState([]);

  // ── Score / meta state ────────────────────────────────────
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [wordsFound, setWordsFound] = useState(0);
  const [combo, setCombo] = useState(0);
  const [typed, setTyped] = useState('');
  const [floatingWord, setFloatingWord] = useState('');
  const [comboBanner, setComboBanner] = useState(null); // { text, color, key }

  // ── Refs for use inside intervals (avoid stale closures) ──
  const gridRef = useRef(makeEmptyGrid());
  const fallingRef = useRef(null);
  const gameOverRef = useRef(false);
  const pausedRef = useRef(false);
  const comboRef = useRef(0);
  const levelRef = useRef(1);
  const wordsFoundRef = useRef(0);
  const lastWordTimeRef = useRef(0);
  const clearingRef = useRef(false); // prevent overlapping clears
  const difficultyRef = useRef(difficulty);
  const challengeRef = useRef(challenge);
  const recentLettersRef = useRef([]);
  const scoreRef = useRef(0);
  const elapsedRef = useRef(0);
  const segmentStartRef = useRef(0);
  const runIdRef = useRef(0);
  const countTokenRef = useRef(0);

  // ── Combo banner ──────────────────────────────────────────
  useEffect(() => {
    if (combo < 2) return;
    const color =
      combo >= 4 ? '#ff66aa'
      : combo === 3 ? '#ffaa44'
      : '#ddccff';
    setComboBanner({ text: `×${combo} COMBO!`, color, key: Date.now() });
    const t = setTimeout(() => setComboBanner(null), 1000);
    return () => clearTimeout(t);
  }, [combo]);

  // Keep refs in sync with state
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { comboRef.current = combo; }, [combo]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { wordsFoundRef.current = wordsFound; }, [wordsFound]);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);
  useEffect(() => { challengeRef.current = challenge; }, [challenge]);

  const readElapsed = useCallback(() => {
    const live = segmentStartRef.current ? performance.now() - segmentStartRef.current : 0;
    return Math.floor(elapsedRef.current + live);
  }, []);

  // ── End a run when the challenge says it is over ─────────
  const finishRun = useCallback((toppedOut) => {
    if (gameOverRef.current) return;
    const elapsed = readElapsed();
    const result = engine.sessionResult(
      challengeRef.current,
      wordsFoundRef.current,
      elapsed,
      toppedOut,
    );
    if (!result.over) return;

    gameOverRef.current = true;
    elapsedRef.current = elapsed;
    segmentStartRef.current = 0;
    fallingRef.current = null;
    setFalling(null);
    setElapsedMs(elapsed);
    setRunResult(result);
    stopMusic();
    if (result.reason === 'topout') playSound('/sound/gameover.wav');
    else if (result.reason !== 'target') playSound('/sound/points.wav');
    const entry = {
      name: getUsername() || guestName(),
      score: scoreRef.current,
      words: wordsFoundRef.current,
      level: levelRef.current,
      difficulty: difficultyRef.current,
      challenge: challengeRef.current,
      timeMs: elapsed,
    };
    if (result.ranks) saveScore(entry);
    const finishedRun = runIdRef.current;
    setBoardRank(null);
    setGameOver(true);
    submitRun(entry).then(async (saved) => {
      if (runIdRef.current !== finishedRun) return;
      if (!result.ranks) {
        setBoardRank(null);
        return;
      }
      try {
        const { scores, combined } = await loadLeaderboard(entry.challenge);
        if (runIdRef.current !== finishedRun) return;
        const index = scores.findIndex((row) => (
          row.score === entry.score
          && String(row.name).toUpperCase() === entry.name.toUpperCase()
          && row.difficulty === entry.difficulty
        ));
        if (index !== -1) {
          setBoardRank(index + 1);
          return;
        }
        setBoardRank(combined && typeof saved.rank === 'number' ? saved.rank : null);
      } catch {
        if (runIdRef.current !== finishedRun) return;
        setBoardRank(typeof saved.rank === 'number' ? saved.rank : null);
      }
    }).catch(() => {
      if (runIdRef.current !== finishedRun || !result.ranks) return;
      const spec = engine.challenge(entry.challenge);
      const index = scoresFor(entry.challenge).findIndex((row) => (
        row.score === entry.score
        && row.name.toUpperCase() === entry.name.toUpperCase()
        && (spec.rankBy !== 'time' || row.timeMs === entry.timeMs)
      ));
      setBoardRank(index === -1 ? null : index + 1);
    });
  }, [readElapsed]);

  const spawnLetter = useCallback((currentGrid) => {
    const mode = difficultyRef.current;
    const col = engine.chooseSpawnColumn(currentGrid, mode, Math.random());
    if (col === null) {
      finishRun(true);
      return;
    }

    const letter = engine.chooseLetter(recentLettersRef.current, mode, Math.random());
    recentLettersRef.current = [...recentLettersRef.current, letter].slice(-12);
    const color = getLetterColor(letter);
    const newFalling = { letter, row: 0, col, color };
    fallingRef.current = newFalling;
    setFalling(newFalling);
  }, [finishRun]);

  // ── Lock falling letter into grid. Returns null when the column tops out.
  const settlePiece = useCallback((currentGrid, piece) => {
    if (!piece) return currentGrid;
    const { row, col, letter, color } = piece;
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return currentGrid;

    const next = currentGrid.map((line) => [...line]);
    next[row][col] = { letter, color };
    const settled = engine.applyGravity(next);
    gridRef.current = settled;
    setGrid(settled);
    fallingRef.current = null;
    setFalling(null);

    if (settled[0][col]) {
      finishRun(true);
      return null;
    }
    return settled;
  }, [finishRun]);

  // ── Tick: move falling letter down ────────────────────────
  const tick = useCallback(() => {
    if (gameOverRef.current || pausedRef.current || clearingRef.current) return;

    const f = fallingRef.current;
    const g = gridRef.current;

    if (!f) {
      spawnLetter(g);
      return;
    }

    const nextRow = f.row + 1;

    // Can we move down?
    const blocked =
      nextRow >= ROWS ||
      (g[nextRow][f.col] !== null);

    if (blocked) {
      const settled = settlePiece(g, f);
      if (settled) spawnLetter(settled);
    } else {
      const newFalling = { ...f, row: nextRow };
      fallingRef.current = newFalling;
      setFalling(newFalling);
    }
  }, [spawnLetter, settlePiece]);

  // ── Game loop via setInterval ──────────────────────────────
  const tickRef = useRef(tick);
  useEffect(() => { tickRef.current = tick; }, [tick]);

  const intervalRef = useRef(null);

  const startLoop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      tickRef.current();
    }, engine.fallInterval(levelRef.current, difficultyRef.current));
  }, []);

  const stopLoop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Restart loop when level changes. The countdown holds the first drop.
  useEffect(() => {
    if (started && !gameOver && countdown == null) {
      startLoop();
    }
    return stopLoop;
  }, [level, started, gameOver, countdown, startLoop, stopLoop]);

  // Playing time. Pause freezes it. Only the timed challenge ends from the clock.
  useEffect(() => {
    if (!started || gameOver || countdown != null) return undefined;
    const spec = engine.challenge(challengeRef.current);
    if (spec.goal === 'survival') return undefined;
    const id = setInterval(() => {
      if (gameOverRef.current || pausedRef.current) return;
      const elapsed = readElapsed();
      setElapsedMs(elapsed);
      if (spec.goal === 'time') finishRun(false);
    }, 100);
    return () => clearInterval(id);
  }, [started, gameOver, countdown, readElapsed, finishRun]);

  // ── Quit to start screen ───────────────────────────────────
  const quitGame = useCallback(() => {
    stopLoop();
    countTokenRef.current += 1;
    setCountdown(null);
    playPageMusic();
    runIdRef.current += 1;
    segmentStartRef.current = 0;
    gameOverRef.current = false;
    fallingRef.current = null;
    pausedRef.current = false;
    setFalling(null);
    setStarted(false);
    setGameOver(false);
    setPaused(false);
    setBoardRank(null);
  }, [stopLoop]);

  // ── Start game ─────────────────────────────────────────────
  const startGame = useCallback((difficultyId, challengeId) => {
    const mode = RULES.difficulties[difficultyId] ? difficultyId : difficultyRef.current;
    const goal = RULES.challenges[challengeId] ? challengeId : challengeRef.current;
    const emptyGrid = makeEmptyGrid();
    runIdRef.current += 1;
    gridRef.current = emptyGrid;
    fallingRef.current = null;
    gameOverRef.current = false;
    pausedRef.current = false;
    comboRef.current = 0;
    levelRef.current = 1;
    wordsFoundRef.current = 0;
    lastWordTimeRef.current = 0;
    clearingRef.current = false;
    difficultyRef.current = mode;
    challengeRef.current = goal;
    recentLettersRef.current = [];
    scoreRef.current = 0;
    elapsedRef.current = 0;
    segmentStartRef.current = 0;
    countTokenRef.current += 1;

    setGrid(emptyGrid);
    setFalling(null);
    setScore(0);
    setLevel(1);
    setWordsFound(0);
    setCombo(0);
    setTyped('');
    setFloatingWord('');
    setClearedCells([]);
    setGameOver(false);
    setPaused(false);
    setDifficulty(mode);
    setChallenge(goal);
    setElapsedMs(0);
    setRunResult(null);
    setBoardRank(null);
    setStarted(true);
    setCountdown(3);
    fadeOutMusic();
  }, []);

  // 3, 2, 1. Pieces, the clock, and the game track wait until it ends.
  useEffect(() => {
    if (!started || countdown == null) return undefined;
    const token = countTokenRef.current;
    const id = setTimeout(() => {
      if (countTokenRef.current !== token) return;
      if (countdown > 1) {
        setCountdown(countdown - 1);
        return;
      }
      segmentStartRef.current = performance.now();
      playGameMusic();
      spawnLetter(gridRef.current);
      setCountdown(null);
    }, 1000);
    return () => clearTimeout(id);
  }, [started, countdown, spawnLetter]);

  // ── Submit word ────────────────────────────────────────────
  const submitWord = useCallback(() => {
    if (pausedRef.current || gameOverRef.current || clearingRef.current || countdown != null) return;
    const mode = difficultyRef.current;
    const word = typed.toUpperCase();
    if (!engine.isValidWord(word, mode)) return;

    const g = gridRef.current;
    const cells = engine.findWordCells(word, g);
    if (!cells) return;

    const spec = engine.difficulty(mode);
    const now = Date.now();
    let newCombo;
    if (now - lastWordTimeRef.current < spec.comboWindowMs && lastWordTimeRef.current > 0) {
      newCombo = comboRef.current + 1;
    } else {
      newCombo = 1;
    }
    lastWordTimeRef.current = now;
    comboRef.current = newCombo;
    setCombo(newCombo);

    const pts = engine.calculateScore(word.length, newCombo, spec.scoreMultiplier || 1);
    setScore((prev) => {
      const next = prev + pts;
      scoreRef.current = next;
      return next;
    });

    const newWordsFound = wordsFoundRef.current + 1;
    wordsFoundRef.current = newWordsFound;
    setWordsFound(newWordsFound);

    const newLevel = engine.levelForWords(newWordsFound, mode);
    if (newLevel !== levelRef.current) {
      levelRef.current = newLevel;
      setLevel(newLevel);
    }

    // Floating word + points sound
    playSound('/sound/points.wav');
    setFloatingWord(word);
    setTimeout(() => setFloatingWord(''), 900);

    // Clear cells with animation
    clearingRef.current = true;
    setClearedCells(cells);

    setTyped('');
    finishRun(false);

    const runId = runIdRef.current;
    setTimeout(() => {
      if (runIdRef.current !== runId) return;
      // Remove those cells from grid
      const newGrid = gridRef.current.map((row) => [...row]);
      for (const { row, col } of cells) {
        newGrid[row][col] = null;
      }
      const gravGrid = engine.applyGravity(newGrid);
      gridRef.current = gravGrid;
      setGrid(gravGrid);
      setClearedCells([]);
      clearingRef.current = false;
    }, 320);
  }, [typed, finishRun, countdown]);

  // ── Keyboard controls ─────────────────────────────────────
  const handleLeft = useCallback(() => {
    const f = fallingRef.current;
    const g = gridRef.current;
    if (!f || pausedRef.current || gameOverRef.current) return;
    const newCol = f.col - 1;
    if (newCol < 0) return;
    if (g[f.row][newCol] !== null) return;
    const newFalling = { ...f, col: newCol };
    fallingRef.current = newFalling;
    setFalling(newFalling);
  }, []);

  const handleRight = useCallback(() => {
    const f = fallingRef.current;
    const g = gridRef.current;
    if (!f || pausedRef.current || gameOverRef.current) return;
    const newCol = f.col + 1;
    if (newCol >= COLS) return;
    if (g[f.row][newCol] !== null) return;
    const newFalling = { ...f, col: newCol };
    fallingRef.current = newFalling;
    setFalling(newFalling);
  }, []);

  const handleDown = useCallback(() => {
    // Speed up: temporarily double tick rate
    tick();
  }, [tick]);

  const handleSpace = useCallback(() => {
    // Hard drop
    const f = fallingRef.current;
    const g = gridRef.current;
    if (!f || pausedRef.current || gameOverRef.current) return;

    // Find lowest empty row in column
    let dropRow = f.row;
    while (dropRow + 1 < ROWS && g[dropRow + 1][f.col] === null) {
      dropRow++;
    }

    if (dropRow === f.row) {
      // Already at bottom, just lock
    }

    const droppedFalling = { ...f, row: dropRow };
    const settled = settlePiece(g, droppedFalling);
    if (settled) spawnLetter(settled);
  }, [settlePiece, spawnLetter]);

  const handleEscape = useCallback(() => {
    if (gameOverRef.current || countdown != null) return;
    setPaused((prev) => {
      const next = !prev;
      const now = performance.now();
      if (next) {
        if (segmentStartRef.current) {
          elapsedRef.current += now - segmentStartRef.current;
          segmentStartRef.current = 0;
        }
        setElapsedMs(Math.floor(elapsedRef.current));
        pauseMusic();
      } else {
        segmentStartRef.current = now;
        resumeMusic();
      }
      pausedRef.current = next;
      return next;
    });
  }, [countdown]);

  useKeyboard({
    onLeft: handleLeft,
    onRight: handleRight,
    onDown: handleDown,
    onSpace: handleSpace,
    onEscape: handleEscape,
    enabled: started && !gameOver && countdown == null,
  });

  // ── Global letter input (no focus required) ────────────────
  useEffect(() => {
    if (!started || gameOver || countdown != null) return;
    const handler = (e) => {
      if (pausedRef.current) return;
      if (/^[a-zA-Z]$/.test(e.key)) {
        const maxLength = engine.difficulty(difficultyRef.current).maxWordLength;
        setTyped((prev) => (prev.length < maxLength ? prev + e.key.toUpperCase() : prev));
      } else if (e.key === 'Backspace') {
        setTyped(prev => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        submitWord();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [started, gameOver, countdown, submitWord]);

  // ── Render ─────────────────────────────────────────────────
  const challengeSpec = engine.challenge(challenge);
  const middleStat = challengeSpec.goal === 'survival'
    ? { label: 'Level', value: level, color: '#00ccee' }
    : challengeSpec.goal === 'words'
      ? { label: 'Time', value: formatClock(elapsedMs), color: '#33ff66' }
      : { label: 'Time', value: formatRemaining(Math.max(0, challengeSpec.limitMs - elapsedMs)), color: '#ffaa44' };
  const wordsLabel = challengeSpec.goal === 'words'
    ? `${wordsFound}/${challengeSpec.targetWords}`
    : wordsFound;

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #03030e 0%, #07091e 25%, #090e38 55%, #0e1458 80%, #141870 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 0',
      }}
    >
      <PixelBackground />

      {/* Quit button — top-left, only during active game */}
      {started && !gameOver && (
        <div
          style={{
            position: 'fixed',
            top: 16,
            right: 20,
            fontFamily: "'BoutiqueBitmap', sans-serif",
            fontSize: 12,
            letterSpacing: 3,
            textAlign: 'right',
            zIndex: 50,
          }}
        >
          <div style={{ color: CHALLENGE_COLOR[challenge], textShadow: `0 0 8px ${CHALLENGE_COLOR[challenge]}` }}>
            {engine.challenge(challenge).label}
          </div>
          <div style={{ color: MODE_COLOR[difficulty], textShadow: `0 0 8px ${MODE_COLOR[difficulty]}`, marginTop: 4 }}>
            {engine.difficulty(difficulty).label}
          </div>
        </div>
      )}

      {started && !gameOver && <QuitButton onQuit={quitGame} />}

      {started && !gameOver && countdown == null && (
        <button
          type="button"
          className="music-shuffle"
          aria-label="Shuffle music"
          onClick={() => { clickSound(); shuffleGameMusic(); }}
        >
          <ShuffleMark />
          BGM
        </button>
      )}

      {!started && <StartScreen onStart={startGame} />}
      {gameOver && started && (
        <GameOverScreen
          score={score}
          wordsFound={wordsFound}
          level={level}
          difficulty={difficulty}
          challenge={challenge}
          timeMs={elapsedMs}
          reason={runResult?.reason || 'topout'}
          onPlayAgain={() => startGame(difficulty, challenge)}
          onQuit={quitGame}
          playerName={getUsername() || guestName()}
          rank={boardRank}
        />
      )}

      {started && (
        <div
          ref={columnRef}
          style={{
            '--cell': `${board.cell}px`,
            '--gap': `${board.gap}px`,
            '--pad': `${board.pad}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: board.gridW,
            position: 'relative',
          }}
        >
          {/* Title */}
          <h1
            style={{
              fontFamily: "'BoutiqueBitmap', sans-serif",
              fontWeight: 900,
              fontSize: 'max(30px, calc(var(--cell) * 0.72))',
              letterSpacing: 8,
              margin: '0 0 8px',
              color: '#00ddff',
              textShadow: '0 0 10px #00ddff, 0 0 30px #00ddff66',
            }}
          >
            LETTRIS
          </h1>

          <StatsBar
            score={score}
            middle={middleStat}
            wordsLabel={wordsLabel}
            combo={combo}
            comboBanner={comboBanner}
          />

          <div style={{ position: 'relative', width: '100%' }}>
            <Grid
              grid={grid}
              falling={falling}
              clearedCells={clearedCells}
            />

            {countdown != null && (
              <div className="countdown-veil" role="status" aria-live="assertive" aria-label={`Starting in ${countdown}`}>
                <div
                  key={countdown}
                  className="countdown-num"
                  style={{ '--ink': MODE_COLOR[difficulty] }}
                >
                  {countdown}
                </div>
              </div>
            )}

            {paused && countdown == null && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(4,4,20,0.82)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                  borderRadius: 4,
                  backdropFilter: 'blur(2px)',
                }}
              >
                <div
                  style={{
                    fontFamily: "'BoutiqueBitmap', sans-serif",
                    fontWeight: 700,
                    fontSize: 'max(36px, calc(var(--cell) * 0.9))',
                    letterSpacing: 8,
                    color: '#ddccff',
                    textShadow: '0 0 12px #ddccff, 0 0 40px rgba(221,204,255,0.4)',
                  }}
                >
                  PAUSED
                </div>
              </div>
            )}

            {/* Floating word animation */}
            {floatingWord && (
              <div
                className="anim-float-up"
                style={{
                  position: 'absolute',
                  top: '40%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontFamily: "'BoutiqueBitmap', sans-serif",
                  fontWeight: 700,
                  fontSize: 'max(22px, calc(var(--cell) * 0.5))',
                  letterSpacing: 5,
                  color: '#33ff66',
                  textShadow: '0 0 10px #33ff66, 0 0 30px #33ff6666',
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                  zIndex: 20,
                }}
              >
                {floatingWord}
              </div>
            )}
          </div>

          <InputBar
            typed={typed}
            onSubmit={submitWord}
            onPause={handleEscape}
            paused={paused}
            grid={grid}
            difficulty={difficulty}
          />

          <p
            style={{
              fontFamily: "'BoutiqueBitmap', sans-serif",
              color: 'rgba(255,255,255,0.3)',
              fontSize: 'max(10px, calc(var(--cell) * 0.22))',
              letterSpacing: 2,
              marginTop: 8,
              textAlign: 'center',
            }}
          >
            ← → MOVE | ↓ DROP | SPACE HARD DROP
          </p>
        </div>
      )}
    </div>
  );
}

export default Game;
