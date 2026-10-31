import { RULES, todayDaily } from './dictionary';

const USERNAME_KEY = 'lettris_username';
const PLAYER_KEY = 'lettris_player_id';
const SCORES_KEY   = 'lettris_scores';
const DIFFICULTY_KEY = 'lettris_difficulty';
const CHALLENGE_KEY = 'lettris_challenge';
const MAX_SCORES   = 10;
const DIFFICULTIES = new Set(RULES.order);
const CHALLENGES = new Set(RULES.challengeOrder);

export function getPlayerId() {
  const existing = localStorage.getItem(PLAYER_KEY) || '';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(existing)) {
    return existing;
  }
  const id = crypto.randomUUID();
  localStorage.setItem(PLAYER_KEY, id);
  return id;
}

export function guestName() {
  const slice = getPlayerId().replace(/-/g, '').slice(0, 5);
  const number = String(Number.parseInt(slice, 16) % 100000).padStart(5, '0');
  return `PLAYER - ${number}`;
}

export function getUsername() {
  return localStorage.getItem(USERNAME_KEY) || '';
}

export function saveUsername(name) {
  localStorage.setItem(USERNAME_KEY, name.trim());
}

export function clearUsername() {
  localStorage.removeItem(USERNAME_KEY);
}

export function getDifficulty() {
  const stored = localStorage.getItem(DIFFICULTY_KEY);
  return DIFFICULTIES.has(stored) ? stored : 'medium';
}

export function saveDifficulty(difficulty) {
  if (DIFFICULTIES.has(difficulty)) {
    localStorage.setItem(DIFFICULTY_KEY, difficulty);
  }
}

export function getChallenge() {
  const stored = localStorage.getItem(CHALLENGE_KEY);
  return CHALLENGES.has(stored) ? stored : 'survival';
}

export function saveChallenge(challenge) {
  if (CHALLENGES.has(challenge)) {
    localStorage.setItem(CHALLENGE_KEY, challenge);
  }
}

function challengeOf(entry) {
  return CHALLENGES.has(entry.challenge) ? entry.challenge : 'survival';
}

function difficultyOf(entry) {
  return DIFFICULTIES.has(entry.difficulty) ? entry.difficulty : 'medium';
}

function utcDayKey() {
  const { year, month, day } = todayDaily();
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function compareEntries(challenge, a, b) {
  const rankBy = RULES.challenges[challenge]?.rankBy;
  if (rankBy === 'time') {
    const delta = (a.timeMs ?? Number.MAX_SAFE_INTEGER) - (b.timeMs ?? Number.MAX_SAFE_INTEGER);
    if (delta !== 0) return delta;
  }
  if (rankBy === 'collects') {
    if (b.words !== a.words) return b.words - a.words;
  }
  return b.score - a.score;
}

export function getScores() {
  try {
    return JSON.parse(localStorage.getItem(SCORES_KEY)) || [];
  } catch {
    return [];
  }
}

export function scoresFor(challenge = 'survival') {
  const goal = CHALLENGES.has(challenge) ? challenge : 'survival';
  const target = goal === 'words' ? RULES.challenges.words.targetWords : null;
  let rows = getScores()
    .filter((entry) => challengeOf(entry) === goal)
    .filter((entry) => target == null || entry.words >= target);
  if (RULES.challenges[goal]?.rankBy === 'collects') {
    const today = utcDayKey();
    const best = new Map();
    for (const entry of rows) {
      if (entry.day !== today) continue;
      const key = entry.name.toUpperCase();
      const current = best.get(key);
      if (!current || compareEntries(goal, entry, current) < 0) best.set(key, entry);
    }
    rows = [...best.values()];
  }
  return rows.sort((a, b) => compareEntries(goal, a, b));
}

export function saveScore({ name, score, words, level, difficulty, challenge = 'survival', timeMs = 0 }) {
  const mode = DIFFICULTIES.has(difficulty) ? difficulty : 'medium';
  const goal = CHALLENGES.has(challenge) ? challenge : 'survival';
  if (goal === 'words' && words < RULES.challenges.words.targetWords) {
    return getScores();
  }
  const scores = getScores();
  scores.push({
    name,
    score,
    words,
    level,
    difficulty: mode,
    challenge: goal,
    timeMs,
    date: new Date().toLocaleDateString(),
    day: goal === 'daily' ? utcDayKey() : undefined,
  });

  const buckets = new Map();
  for (const entry of scores) {
    const entryMode = difficultyOf(entry);
    const entryGoal = challengeOf(entry);
    const key = entryGoal;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push({ ...entry, difficulty: entryMode, challenge: entryGoal });
  }

  const trimmed = [];
  for (const [key, list] of buckets) {
    const entryGoal = key.split(':')[0];
    list.sort((a, b) => compareEntries(entryGoal, a, b));
    trimmed.push(...list.slice(0, MAX_SCORES));
  }
  localStorage.setItem(SCORES_KEY, JSON.stringify(trimmed));
  return trimmed;
}
