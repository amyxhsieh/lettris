import { getPlayerId } from './storage';

export async function fetchStats() {
  const response = await fetch('/api/stats');
  if (!response.ok) throw new Error('stats');
  const body = await response.json();
  return {
    players: Number(body.players) || 0,
    games: Number(body.games) || 0,
  };
}

async function readScores(response) {
  if (!response.ok) return null;
  const body = await response.json();
  return Array.isArray(body.scores) ? body.scores : [];
}

export async function loadLeaderboard(challenge) {
  const shared = await fetch(`/api/leaderboard?${new URLSearchParams({ challenge })}`);
  const sharedScores = await readScores(shared);
  if (sharedScores) return { scores: sharedScores, combined: true };

  const pieces = await Promise.all(['easy', 'medium', 'hard'].map(async (difficulty) => {
    const response = await fetch(`/api/leaderboard?${new URLSearchParams({ challenge, difficulty })}`);
    return (await readScores(response)) || [];
  }));
  const seen = new Set();
  const scores = [];
  for (const row of pieces.flat()) {
    const key = `${row.name}|${row.score}|${row.timeMs}|${row.difficulty}`;
    if (seen.has(key)) continue;
    seen.add(key);
    scores.push(row);
  }
  scores.sort((a, b) => b.score - a.score);
  return { scores: scores.slice(0, 10), combined: false };
}

export async function fetchLeaderboard(challenge) {
  const { scores } = await loadLeaderboard(challenge);
  return scores;
}

export async function submitRun(entry) {
  const response = await fetch('/api/runs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      playerId: getPlayerId(),
      name: entry.name,
      score: entry.score,
      words: entry.words,
      level: entry.level,
      difficulty: entry.difficulty,
      challenge: entry.challenge,
      timeMs: entry.timeMs,
    }),
  });
  if (!response.ok) throw new Error('run');
  return response.json();
}
