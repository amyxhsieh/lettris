/**
 * Browser port of engine/lettris_engine.py.
 * engine/check_parity.mjs fails if these drift from the Python rules.
 */

export function weightedPick(items, weights, roll) {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let cursor = roll * total;
  for (let index = 0; index < items.length; index += 1) {
    cursor -= weights[index];
    if (cursor <= 0) return items[index];
  }
  return items[items.length - 1];
}

function comboParts(combo) {
  if (combo >= 4) return [5, 2];
  if (combo === 3) return [2, 1];
  if (combo === 2) return [3, 2];
  return [1, 1];
}

export function calculateScore(wordLength, combo, multiplier = 1) {
  const [numerator, denominator] = comboParts(combo);
  return Math.floor((wordLength * wordLength * 10 * numerator * multiplier) / denominator);
}

export function fallInterval(level, difficulty) {
  const raw = difficulty.startSpeed - (level - 1) * difficulty.speedStep;
  return Math.max(difficulty.minSpeed, raw);
}

export function levelForWords(wordsFound, wordsPerLevel) {
  return Math.floor(wordsFound / wordsPerLevel) + 1;
}

export function cellLetter(cell) {
  if (!cell) return null;
  if (typeof cell === 'string') return cell.toUpperCase();
  if (cell.letter) return String(cell.letter).toUpperCase();
  return null;
}

export function applyGravity(grid) {
  const rows = grid.length;
  const cols = rows ? grid[0].length : 0;
  const settled = Array.from({ length: rows }, () => Array(cols).fill(null));
  for (let col = 0; col < cols; col += 1) {
    const stack = [];
    for (let row = 0; row < rows; row += 1) {
      if (cellLetter(grid[row][col])) stack.push(grid[row][col]);
    }
    const start = rows - stack.length;
    for (let index = 0; index < stack.length; index += 1) {
      settled[start + index][col] = stack[index];
    }
  }
  return settled;
}

export function columnRoom(grid, col) {
  let room = 0;
  for (let row = 0; row < grid.length; row += 1) {
    if (cellLetter(grid[row][col]) == null) room += 1;
    else break;
  }
  return room;
}

export function chooseSpawnColumn(grid, difficulty, roll) {
  const cols = grid[0].length;
  const rooms = [];
  for (let col = 0; col < cols; col += 1) rooms.push(columnRoom(grid, col));
  const comfortable = [];
  const anyRoom = [];
  for (let col = 0; col < cols; col += 1) {
    if (rooms[col] >= 2) comfortable.push(col);
    if (rooms[col] >= 1) anyRoom.push(col);
  }
  const candidates = comfortable.length ? comfortable : anyRoom;
  if (!candidates.length) return null;
  const weights = difficulty.columnBias <= 1
    ? candidates.map(() => 1)
    : candidates.map((col) => rooms[col] ** difficulty.columnBias);
  return weightedPick(candidates, weights, roll);
}

const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']);

export function chooseLetter(recent, difficulty, roll) {
  const history = recent.map((letter) => letter.toUpperCase());
  const window = history.slice(-difficulty.vowelWindow);
  const vowelCount = window.filter((letter) => VOWELS.has(letter)).length;
  let pool = difficulty.letterWeights;
  if (
    difficulty.minVowelsInWindow > 0
    && history.length >= difficulty.vowelWindow
    && vowelCount < difficulty.minVowelsInWindow
  ) {
    pool = pool.filter(([letter]) => VOWELS.has(letter));
  }
  return weightedPick(
    pool.map(([letter]) => letter),
    pool.map(([, weight]) => weight),
    roll,
  );
}

export function findWordCells(word, grid) {
  if (!word) return null;
  const needed = word.toUpperCase().split('');
  const rows = grid.length;
  const cols = rows ? grid[0].length : 0;
  const available = [];
  for (let row = rows - 1; row >= 0; row -= 1) {
    for (let col = 0; col < cols; col += 1) {
      const letter = cellLetter(grid[row][col]);
      if (letter) available.push([letter, row, col]);
    }
  }

  const used = new Set();
  const cells = [];
  for (const letter of needed) {
    let found = null;
    for (let index = 0; index < available.length; index += 1) {
      if (used.has(index) || available[index][0] !== letter) continue;
      found = index;
      cells.push({ row: available[index][1], col: available[index][2] });
      break;
    }
    if (found == null) return null;
    used.add(found);
  }
  return cells;
}

export function sessionResult(challenge, words, elapsedMs, toppedOut) {
  if (challenge.goal === 'survival') {
    if (toppedOut) return { over: true, cleared: false, reason: 'topout', ranks: true };
    return { over: false, cleared: false, reason: null, ranks: false };
  }
  if (challenge.goal === 'words') {
    if (words >= challenge.targetWords) {
      return { over: true, cleared: true, reason: 'target', ranks: true };
    }
    if (toppedOut) return { over: true, cleared: false, reason: 'topout', ranks: false };
    return { over: false, cleared: false, reason: null, ranks: false };
  }
  if (challenge.goal === 'time') {
    if (elapsedMs >= challenge.limitMs) {
      return { over: true, cleared: true, reason: 'time', ranks: true };
    }
    if (toppedOut) return { over: true, cleared: false, reason: 'topout', ranks: true };
    return { over: false, cleared: false, reason: null, ranks: false };
  }
  throw new Error(challenge.goal);
}

export function isValidWord(word, difficulty, words) {
  if (!word || !/^[a-zA-Z]+$/.test(word)) return false;
  const normalized = word.toLowerCase();
  if (normalized.length < difficulty.minWordLength || normalized.length > difficulty.maxWordLength) {
    return false;
  }
  return words.has(normalized);
}

export function createEngine(rules) {
  const words = new Set(rules.words);

  return {
    rules,
    difficulty(difficultyId) {
      return rules.difficulties[difficultyId];
    },
    challenge(challengeId) {
      return rules.challenges[challengeId];
    },
    sessionResult(challengeId, words, elapsedMs, toppedOut) {
      return sessionResult(rules.challenges[challengeId], words, elapsedMs, toppedOut);
    },
    isValidWord(word, difficultyId) {
      return isValidWord(word, rules.difficulties[difficultyId], words);
    },
    findWordCells,
    canFormWord(word, grid) {
      return findWordCells(word, grid) !== null;
    },
    chooseLetter(recent, difficultyId, roll) {
      return chooseLetter(recent, rules.difficulties[difficultyId], roll);
    },
    chooseSpawnColumn(grid, difficultyId, roll) {
      return chooseSpawnColumn(grid, rules.difficulties[difficultyId], roll);
    },
    fallInterval(level, difficultyId) {
      return fallInterval(level, rules.difficulties[difficultyId]);
    },
    levelForWords(wordsFound, difficultyId) {
      return levelForWords(wordsFound, rules.difficulties[difficultyId].wordsPerLevel);
    },
    calculateScore,
    applyGravity,
  };
}
