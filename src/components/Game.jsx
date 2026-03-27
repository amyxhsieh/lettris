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
import { getRandomLetter, getLetterColor } from '../utils/letters';
import { isValidWord, canFormWord, findWordCells } from '../utils/dictionary';
import { calculateScore } from '../utils/scoring';
import { useKeyboard } from '../hooks/useKeyboard';
import '../styles/animations.css';

const ROWS = 14;
const COLS = 8;
const WORDS_PER_LEVEL = 3;
const COMBO_TIMEOUT_MS = 3000;

function makeEmptyGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function getSpeed(level) {
  return Math.max(200, 900 - level * 80);
}

function Game() {
  // ── UI state ──────────────────────────────────────────────
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

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

  // Keep refs in sync with state
  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { comboRef.current = combo; }, [combo]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { wordsFoundRef.current = wordsFound; }, [wordsFound]);

  // ── Spawn letter ──────────────────────────────────────────
  const spawnLetter = useCallback((currentGrid) => {
    const col = Math.floor(Math.random() * COLS);

    // If top row of that column is occupied → game over
    if (currentGrid[0][col] !== null) {
      gameOverRef.current = true;
      setGameOver(true);
      return;
    }

    const letter = getRandomLetter();
    const color = getLetterColor(letter);
    const newFalling = { letter, row: 0, col, color };
    fallingRef.current = newFalling;
    setFalling(newFalling);
  }, []);

  // ── Apply gravity: compact each column downward ───────────
  const applyGravity = useCallback((g) => {
    const newGrid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    for (let col = 0; col < COLS; col++) {
      const colCells = [];
      for (let row = 0; row < ROWS; row++) {
        if (g[row][col] !== null) colCells.push(g[row][col]);
      }
      // Place cells at bottom
      let startRow = ROWS - colCells.length;
      for (let i = 0; i < colCells.length; i++) {
        newGrid[startRow + i][col] = colCells[i];
      }
    }
    return newGrid;
  }, []);

  // ── Lock falling letter into grid ─────────────────────────
  const lockFalling = useCallback((currentGrid, currentFalling) => {
    if (!currentFalling) return currentGrid;

    const newGrid = currentGrid.map(row => [...row]);
    const { row, col, letter, color } = currentFalling;

    // Double-check bounds
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return newGrid;

    newGrid[row][col] = { letter, color };
    const gravGrid = applyGravity(newGrid);
    gridRef.current = gravGrid;
    setGrid(gravGrid);
    return gravGrid;
  }, [applyGravity]);

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
      // Check if at row 0 → game over
      if (f.row === 0) {
        gameOverRef.current = true;
        setGameOver(true);
        fallingRef.current = null;
        setFalling(null);
        return;
      }
      // Lock it
      const newGrid = lockFalling(g, f);
      fallingRef.current = null;
      setFalling(null);
      spawnLetter(newGrid);
    } else {
      const newFalling = { ...f, row: nextRow };
      fallingRef.current = newFalling;
      setFalling(newFalling);
    }
  }, [spawnLetter, lockFalling]);

  // ── Game loop via setInterval ──────────────────────────────
  const tickRef = useRef(tick);
  useEffect(() => { tickRef.current = tick; }, [tick]);

  const intervalRef = useRef(null);

  const startLoop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      tickRef.current();
    }, getSpeed(levelRef.current));
  }, []);

  const stopLoop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Restart loop when level changes
  useEffect(() => {
    if (started && !gameOver) {
      startLoop();
    }
    return stopLoop;
  }, [level, started, gameOver, startLoop, stopLoop]);

  // ── Start game ─────────────────────────────────────────────
  const startGame = useCallback(() => {
    const emptyGrid = makeEmptyGrid();
    gridRef.current = emptyGrid;
    fallingRef.current = null;
    gameOverRef.current = false;
    pausedRef.current = false;
    comboRef.current = 0;
    levelRef.current = 1;
    wordsFoundRef.current = 0;
    lastWordTimeRef.current = 0;
    clearingRef.current = false;

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
    setStarted(true);
  }, []);

  // Spawn first letter after start
  useEffect(() => {
    if (started && !gameOver) {
      spawnLetter(gridRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started]);

  // ── Submit word ────────────────────────────────────────────
  const submitWord = useCallback(() => {
    const word = typed.toUpperCase();
    if (word.length < 3) return;
    if (!isValidWord(word)) {
      // Shake animation via class on input — handled by InputBar state
      return;
    }
    const g = gridRef.current;
    if (!canFormWord(word, g)) return;

    const cells = findWordCells(word, g);
    if (cells.length !== word.length) return;

    // Combo logic
    const now = Date.now();
    let newCombo;
    if (now - lastWordTimeRef.current < COMBO_TIMEOUT_MS) {
      newCombo = comboRef.current + 1;
    } else {
      newCombo = 1;
    }
    lastWordTimeRef.current = now;
    comboRef.current = newCombo;
    setCombo(newCombo);

    // Scoring
    const pts = calculateScore(word.length, newCombo);
    setScore((prev) => prev + pts);

    // Words count & level
    const newWordsFound = wordsFoundRef.current + 1;
    wordsFoundRef.current = newWordsFound;
    setWordsFound(newWordsFound);

    const newLevel = Math.floor(newWordsFound / WORDS_PER_LEVEL) + 1;
    if (newLevel !== levelRef.current) {
      levelRef.current = newLevel;
      setLevel(newLevel);
    }

    // Floating word
    setFloatingWord(word);
    setTimeout(() => setFloatingWord(''), 900);

    // Clear cells with animation
    clearingRef.current = true;
    setClearedCells(cells);

    setTyped('');

    setTimeout(() => {
      // Remove those cells from grid
      const newGrid = gridRef.current.map((row) => [...row]);
      for (const { row, col } of cells) {
        newGrid[row][col] = null;
      }
      const gravGrid = applyGravity(newGrid);
      gridRef.current = gravGrid;
      setGrid(gravGrid);
      setClearedCells([]);
      clearingRef.current = false;
    }, 320);
  }, [typed, applyGravity]);

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
    fallingRef.current = droppedFalling;
    setFalling(droppedFalling);

    // Lock immediately
    const newGrid = lockFalling(g, droppedFalling);
    fallingRef.current = null;
    setFalling(null);
    spawnLetter(newGrid);
  }, [lockFalling, spawnLetter]);

  const handleEscape = useCallback(() => {
    if (gameOverRef.current) return;
    setPaused((prev) => {
      const next = !prev;
      pausedRef.current = next;
      return next;
    });
  }, []);

  useKeyboard({
    onLeft: handleLeft,
    onRight: handleRight,
    onDown: handleDown,
    onSpace: handleSpace,
    onEscape: handleEscape,
    enabled: started && !gameOver,
  });

  // ── Render ─────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #c2e0f8 0%, #82b8e8 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 0',
      }}
    >
      {!started && <StartScreen onStart={startGame} />}
      {gameOver && started && (
        <GameOverScreen
          score={score}
          wordsFound={wordsFound}
          level={level}
          onPlayAgain={startGame}
        />
      )}

      {started && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: COLS * 44 + (COLS - 1) * 3 + 16 + 2,
            position: 'relative',
          }}
        >
          {/* Title */}
          <h1
            style={{
              fontFamily: "'BoutiqueBitmap', sans-serif",
              fontWeight: 900,
              fontSize: 30,
              letterSpacing: 8,
              margin: '0 0 10px',
              color: '#ffffff',
              textShadow: '-2px -2px 0 rgba(40,70,140,0.5), 2px -2px 0 rgba(40,70,140,0.5), -2px 2px 0 rgba(40,70,140,0.5), 2px 2px 0 rgba(40,70,140,0.5)',
            }}
          >
            LETTRIS
          </h1>

          <StatsBar
            score={score}
            level={level}
            wordsFound={wordsFound}
            combo={combo}
          />

          {/* Paused overlay */}
          {paused && (
            <div
              style={{
                position: 'absolute',
                top: 100,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(80,120,180,0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                borderRadius: 10,
                backdropFilter: 'blur(2px)',
              }}
            >
              <div
                style={{
                  fontFamily: "'BoutiqueBitmap', sans-serif",
                  fontWeight: 700,
                  fontSize: 36,
                  letterSpacing: 8,
                  color: '#fff8cc',
                  textShadow: '-1px -1px 0 rgba(40,70,120,0.45), 1px -1px 0 rgba(40,70,120,0.45), -1px 1px 0 rgba(40,70,120,0.45), 1px 1px 0 rgba(40,70,120,0.45)',
                }}
              >
                PAUSED
              </div>
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Grid
              grid={grid}
              falling={falling}
              clearedCells={clearedCells}
            />

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
                  fontSize: 22,
                  letterSpacing: 5,
                  color: '#fff8cc',
                  textShadow: '-1px -1px 0 rgba(40,70,120,0.45), 1px -1px 0 rgba(40,70,120,0.45), -1px 1px 0 rgba(40,70,120,0.45), 1px 1px 0 rgba(40,70,120,0.45)',
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
            onTyped={setTyped}
            onSubmit={submitWord}
            onPause={handleEscape}
            paused={paused}
            grid={grid}
          />

          <p
            style={{
              fontFamily: "'BoutiqueBitmap', sans-serif",
              color: '#ffffff',
              fontSize: 10,
              letterSpacing: 2,
              marginTop: 8,
              textAlign: 'center',
              textShadow: '-1px -1px 0 rgba(40,70,120,0.45), 1px -1px 0 rgba(40,70,120,0.45), -1px 1px 0 rgba(40,70,120,0.45), 1px 1px 0 rgba(40,70,120,0.45)',
              opacity: 0.85,
            }}
          >
            ← → MOVE | ↓ DROP | SPACE HARD DROP | ESC PAUSE
          </p>
        </div>
      )}
    </div>
  );
}

export default Game;
