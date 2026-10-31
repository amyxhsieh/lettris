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

function repeatParts(times) {
  if (times <= 1) return [1, 1];
  if (times === 2) return [1, 2];
  return [1, 4];
}

export function calculateScore(wordLength, combo, multiplier = 1, times = 1) {
  const [comboNumerator, comboDenominator] = comboParts(combo);
  const [repeatNumerator, repeatDenominator] = repeatParts(times);
  return Math.floor(
    (wordLength * wordLength * 10 * comboNumerator * multiplier * repeatNumerator)
    / (comboDenominator * repeatDenominator),
  );
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

const DAILY_LETTER_WEIGHT = 16;
const BRANCH_LETTER_LIMIT = 3;
const BRANCH_BONUS = 6;

export function chooseLetter(recent, difficulty, roll, favored = '', branch = '') {
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
  const counts = {};
  for (const letter of String(favored || '').toUpperCase()) {
    if (letter >= 'A' && letter <= 'Z') counts[letter] = (counts[letter] || 0) + 1;
  }
  const boost = new Set();
  for (const letter of String(branch || '').toUpperCase()) {
    if (letter >= 'A' && letter <= 'Z') boost.add(letter);
  }
  return weightedPick(
    pool.map(([letter]) => letter),
    pool.map(([letter, weight]) => {
      let next = boost.has(letter) ? weight + BRANCH_BONUS : weight;
      const copies = counts[letter] || 0;
      if (copies) next = Math.max(next, DAILY_LETTER_WEIGHT * copies);
      return next;
    }),
    roll,
  );
}

function letterCounts(text) {
  const counts = Array(26).fill(0);
  for (const character of text || []) {
    const code = String(character).toLowerCase().charCodeAt(0);
    if (code >= 97 && code <= 122) counts[code - 97] += 1;
  }
  return counts;
}

function oneShort(word, have) {
  const need = Array(26).fill(0);
  for (let index = 0; index < word.length; index += 1) {
    need[word.charCodeAt(index) - 97] += 1;
  }
  let missing = -1;
  let extra = 0;
  for (let index = 0; index < 26; index += 1) {
    if (need[index] > have[index]) {
      extra += need[index] - have[index];
      if (extra > 1) return null;
      missing = index;
    }
  }
  if (extra !== 1) return null;
  return String.fromCharCode(97 + missing);
}

function branchHits(words, have, blocked, bag, difficulty, common, cleared, exactLength = 0) {
  const hits = new Map();
  for (const word of words) {
    const length = word.length;
    if (length < difficulty.branchMinLength || length > difficulty.branchMaxLength || word === cleared) {
      continue;
    }
    if (exactLength && length !== exactLength) continue;
    if (difficulty.branchCommon && common && !common.has(word)) continue;
    const missing = oneShort(word, have);
    if (!missing || blocked.has(missing) || !bag.has(missing)) continue;
    hits.set(missing, (hits.get(missing) || 0) + 1);
  }
  return hits;
}

function pickBranch(hits) {
  return [...hits.keys()]
    .sort((a, b) => (hits.get(b) - hits.get(a)) || (a < b ? -1 : a > b ? 1 : 0))
    .slice(0, BRANCH_LETTER_LIMIT)
    .join('');
}

export function branchLetters(boardLetters, cleared, difficulty, words, common = null) {
  const normalized = String(cleared || '').toLowerCase().replace(/[^a-z]/g, '');
  const blocked = new Set(normalized);
  const bag = new Set(difficulty.letterWeights.map(([letter]) => letter.toLowerCase()));
  const hits = branchHits(
    words,
    letterCounts(boardLetters),
    blocked,
    bag,
    difficulty,
    common,
    normalized,
  );
  if (hits.size) return pickBranch(hits);
  if (!normalized) return '';
  return pickBranch(branchHits(
    words,
    letterCounts(normalized),
    blocked,
    bag,
    difficulty,
    common,
    normalized,
    normalized.length + 1,
  ));
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
  if (challenge.goal === 'time' || challenge.goal === 'daily') {
    if (elapsedMs >= challenge.limitMs) {
      return { over: true, cleared: true, reason: 'time', ranks: true };
    }
    if (toppedOut) return { over: true, cleared: false, reason: 'topout', ranks: true };
    return { over: false, cleared: false, reason: null, ranks: false };
  }
  throw new Error(challenge.goal);
}

export const UNIX_EPOCH_ORDINAL = 719163;

export function utcOrdinal(year, month, day) {
  return Math.floor(Date.UTC(year, month - 1, day) / 86400000) + UNIX_EPOCH_ORDINAL;
}

export function utcToday(now = new Date()) {
  return {
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
    day: now.getUTCDate(),
  };
}

export function dailyWord(pool, year, month, day) {
  return pool[utcOrdinal(year, month, day) % pool.length];
}

export function dailySeed(year, month, day) {
  const text = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash >>> 0;
}

export function createRolls(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), state | 1);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
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
  const pickBranchLetters = branchLetters;
  const words = new Set(rules.words);
  const common = new Set(rules.commonWords || []);
  const branchPools = {};
  for (const difficultyId of rules.order) {
    const spec = rules.difficulties[difficultyId];
    branchPools[difficultyId] = rules.words.filter((word) => (
      word.length >= spec.branchMinLength
      && word.length <= spec.branchMaxLength
      && (!spec.branchCommon || common.has(word))
    ));
  }

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
    chooseLetter(recent, difficultyId, roll, favored = '', branch = '') {
      return chooseLetter(recent, rules.difficulties[difficultyId], roll, favored, branch);
    },
    branchLetters(board, cleared, difficultyId) {
      return pickBranchLetters(board, cleared, rules.difficulties[difficultyId], branchPools[difficultyId]);
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
    dailyWord(year, month, day) {
      return dailyWord(rules.dailyWords, year, month, day);
    },
    dailySeed,
    createRolls,
  };
}
