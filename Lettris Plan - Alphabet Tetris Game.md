# Lettris — Claude Code Build Prompt

## Project Overview

Build "Lettris" — a Tetris-style word game where alphabet letters fall from the top of the screen and stack up in a grid. The player types words using the landed letters to clear them from the board. The game ends when letters stack to the top.

Think of it as Tetris meets Scrabble meets a typing game.

---

## Core Mechanics

### Grid & Falling Letters
- The play area is an 8-column × 14-row grid
- One letter falls at a time from a random column at the top
- Letters drop one row per tick (starting ~900ms, speeding up with level)
- Letter frequency should match English distribution (E, T, A, O, I, N are more common; Q, Z, X are rare)
- When a letter reaches the bottom or lands on another letter, it locks in place
- Player can move the falling letter left/right with arrow keys, and speed up the drop with the down arrow
- Pressing Space instantly hard-drops the letter to the lowest open row in its current column and locks it immediately (like Tetris)
- If a new letter spawns in a column that's already full to the top → game over

### Word Formation & Clearing
- Below the grid, there's a text input field where the player types words
- The player types a word (minimum 3 letters) using letters that exist on the board, then presses Enter
- If the word is valid AND all its letters are available on the board, those letter cells are cleared (removed)
- After clearing, remaining letters above the gaps fall down (gravity)
- If the word is invalid or letters aren't available, show a shake animation and reject it
- The input should show visual feedback: green border = word can be formed, red border = can't be formed

### Word Validation
- Include a built-in dictionary of common English words (3–6 letters). Aim for at least 2,000+ words covering common 3, 4, 5, and 6 letter words
- Alternatively, use an API or local word list file for validation
- Words must be at least 3 letters long

### Scoring System
- Points = (word length)² × 10 × combo multiplier
- Combo: If the player submits another valid word within 3 seconds, combo increments (x1.5, x2.0, etc.)
- Combo resets after 3 seconds of no valid word
- Every 3 words found → level up (game speed increases)

### Visual Design
- Dark space/cosmic theme with gradient background (#0a0a1a → #1a1a3e)
- Each letter gets a color based on its character (consistent coloring)
- Letters should have a subtle glow/neon effect matching their color
- Animated effects:
  - Letters pop in when they appear (scale animation)
  - Cleared letters do a pop-out/explode animation
  - The completed word floats up from the grid center and fades out
  - Invalid word input shakes the grid
  - Combo counter pulses when active
- Use a monospace font for the grid (JetBrains Mono or Fira Code) and a display font for titles (Orbitron)
- The game should feel polished and arcade-like

### UI Layout
- Title "LETTRIS" at the top with rainbow gradient text
- Stats bar showing: SCORE, LEVEL, WORDS FOUND, COMBO (when active)
- The letter grid centered on screen
- Text input + Enter button + Pause button below the grid
- Start screen with instructions before gameplay begins
- Game over screen showing final score, words found, and level reached, with a "Play Again" button

### Controls
- ← → Arrow keys: move falling letter left/right
- ↓ Arrow key: accelerate drop
- Spacebar: instant hard drop (letter snaps to lowest available row and locks immediately)
- Keyboard typing: enter letters into the word input
- Enter: submit word
- Escape: pause/unpause

---

## Technical Requirements

### Stack
- **React** with functional components and hooks (useState, useEffect, useCallback, useRef)
- **No external game engine** — use React state management and setInterval for the game loop
- CSS-in-JS (inline styles) or CSS modules — keep it self-contained
- Google Fonts loaded via @import or link tag

### Architecture
- `useRef` for values that need to be current inside intervals (grid, falling piece, gameOver, paused)
- Game loop via `setInterval` in a `useEffect`, speed determined by level
- Separate concerns:
  - Letter spawning logic
  - Falling/locking logic
  - Word validation
  - Grid clearing + gravity
  - Scoring + combo tracking
  - Input handling

### State Shape
```
grid: string[][] (ROWS × COLS, null for empty)
falling: { letter, row, col } | null
typed: string (current input)
score: number
level: number
combo: number
wordsFound: number
gameOver: boolean
paused: boolean
started: boolean
cleared: [row, col][] (cells being animated out)
lastWord: string (for floating word animation)
```

### Key Functions
- `spawnLetter()` — pick random column, random weighted letter, create falling piece (or trigger game over)
- `lockFalling(piece)` — write the falling letter into the grid state
- `applyGravity(grid)` — for each column, compact all non-null cells downward
- `submitWord()` — validate word, find letters in grid (bottom-up search), animate clear, update score
- `isValidWord(word)` — check against dictionary, minimum 3 letters
- `canFormWord(word, grid)` — check if all needed letters exist on the board (accounting for duplicates)

### Performance Considerations
- Keep the game loop lean — only update what changes
- Use `useRef` to avoid stale closures in intervals
- Avoid re-rendering the entire grid unnecessarily
- CSS animations over JS animations where possible

---

## Stretch Goals (Nice to Have)

- **Sound effects**: letter land, word clear, combo, game over (use Web Audio API or Tone.js)
- **High score persistence**: save to localStorage
- **Difficulty modes**: Easy (slower, more vowels), Normal, Hard (faster, fewer vowels)
- **Power-ups**: Bomb letter (clears surrounding cells), Wildcard letter (matches any), Time freeze
- **Multiplayer**: Two grids side by side, cleared words send junk letters to opponent
- **Mobile support**: Touch controls for moving letters, on-screen keyboard
- **Word preview**: Highlight which letters on the board will be used when typing
- **Statistics screen**: Most common words used, longest word, average word length

---

## File Structure Suggestion

```
lettris/
├── src/
│   ├── App.jsx
│   ├── components/
│   │   ├── Game.jsx          # Main game container & loop
│   │   ├── Grid.jsx          # Renders the letter grid
│   │   ├── Cell.jsx          # Individual grid cell with animations
│   │   ├── InputBar.jsx      # Word input + submit + pause
│   │   ├── StatsBar.jsx      # Score, level, words, combo
│   │   ├── StartScreen.jsx   # Pre-game instructions
│   │   └── GameOverScreen.jsx
│   ├── hooks/
│   │   ├── useGameLoop.js    # setInterval game tick logic
│   │   └── useKeyboard.js    # Arrow key + escape handling
│   ├── utils/
│   │   ├── dictionary.js     # Word list / validation
│   │   ├── letters.js        # Letter pool, frequency, colors
│   │   └── scoring.js        # Points calculation, combo logic
│   └── styles/
│       └── animations.css    # Keyframe animations
├── public/
│   └── index.html
├── package.json
└── README.md
```

---

## Getting Started Command

```
Create a new React project for this game using Vite. Set up the project structure, implement all core mechanics, and make sure the game is fully playable from start to game-over. Focus on getting the game loop and word validation working first, then polish the visuals and animations.
```
