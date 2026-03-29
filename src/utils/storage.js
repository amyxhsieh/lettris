const USERNAME_KEY = 'lettris_username';
const SCORES_KEY   = 'lettris_scores';
const MAX_SCORES   = 10;

export function getUsername() {
  return localStorage.getItem(USERNAME_KEY) || '';
}

export function saveUsername(name) {
  localStorage.setItem(USERNAME_KEY, name.trim());
}

export function clearUsername() {
  localStorage.removeItem(USERNAME_KEY);
}

export function getScores() {
  try {
    return JSON.parse(localStorage.getItem(SCORES_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveScore({ name, score, words, level }) {
  const scores = getScores();
  scores.push({ name, score, words, level, date: new Date().toLocaleDateString() });
  scores.sort((a, b) => b.score - a.score);
  const trimmed = scores.slice(0, MAX_SCORES);
  localStorage.setItem(SCORES_KEY, JSON.stringify(trimmed));
  return trimmed;
}
