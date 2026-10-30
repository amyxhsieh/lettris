import { RULES } from './dictionary';

const USERNAME_KEY = 'lettris_username';
const SCORES_KEY   = 'lettris_scores';
const DIFFICULTY_KEY = 'lettris_difficulty';
const CHALLENGE_KEY = 'lettris_challenge';
const MAX_SCORES   = 10;
const DIFFICULTIES = new Set(RULES.order);
const CHALLENGES = new Set(RULES.challengeOrder);

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

function compareEntries(challenge, a, b) {
  if (RULES.challenges[challenge]?.rankBy === 'time') {
    const delta = (a.timeMs ?? Number.MAX_SAFE_INTEGER) - (b.timeMs ?? Number.MAX_SAFE_INTEGER);
    if (delta !== 0) return delta;
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

export function scoresFor(difficulty, challenge = 'survival') {
  const mode = DIFFICULTIES.has(difficulty) ? difficulty : 'medium';
  const goal = CHALLENGES.has(challenge) ? challenge : 'survival';
  return getScores()
    .filter((entry) => difficultyOf(entry) === mode && challengeOf(entry) === goal)
    .sort((a, b) => compareEntries(goal, a, b));
}

export function saveScore({ name, score, words, level, difficulty, challenge = 'survival', timeMs = 0 }) {
  const mode = DIFFICULTIES.has(difficulty) ? difficulty : 'medium';
  const goal = CHALLENGES.has(challenge) ? challenge : 'survival';
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
  });

  const buckets = new Map();
  for (const entry of scores) {
    const entryMode = difficultyOf(entry);
    const entryGoal = challengeOf(entry);
    const key = `${entryGoal}:${entryMode}`;
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
