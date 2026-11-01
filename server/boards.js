export const DIFFICULTIES = new Set(['easy', 'medium', 'hard']);

export const CHALLENGES = {
  survival: { rankBy: 'score' },
  words: { rankBy: 'scoreTime', targetWords: 60 },
  timed: { rankBy: 'score' },
  daily: { rankBy: 'collects', lockedDifficulty: 'medium' },
};

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function wholeNumber(value, min, max) {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new HttpError(400, 'invalid run');
  }
  return number;
}

export function cleanRun(body) {
  const source = body && typeof body === 'object' ? body : {};
  const challenge = String(source.challenge || '');
  const difficulty = String(source.difficulty || '');
  const spec = CHALLENGES[challenge];
  if (!spec || !DIFFICULTIES.has(difficulty)) throw new HttpError(400, 'unknown board');

  const playerId = String(source.playerId || '').toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(playerId)) {
    throw new HttpError(400, 'invalid player');
  }

  if (spec.lockedDifficulty && difficulty !== spec.lockedDifficulty) {
    throw new HttpError(400, 'unknown board');
  }

  const name = String(source.name || 'ANON').replace(/[\u0000-\u001f]/g, '').trim().slice(0, 20) || 'ANON';
  const words = wholeNumber(source.words, 0, 999);
  return {
    playerId,
    name,
    score: wholeNumber(source.score, 0, 99_999_999),
    words,
    level: wholeNumber(source.level, 1, 999),
    difficulty,
    challenge,
    timeMs: wholeNumber(source.timeMs, 0, 86_400_000),
    ranks: challenge === 'words' ? words >= spec.targetWords : true,
    rankBy: spec.rankBy,
  };
}

export function isBetter(rankBy, candidate, entry) {
  if (rankBy === 'time') {
    if (candidate.timeMs !== entry.timeMs) return candidate.timeMs < entry.timeMs;
    return candidate.score > entry.score;
  }
  if (rankBy === 'collects') {
    if (candidate.words !== entry.words) return candidate.words > entry.words;
    return candidate.score > entry.score;
  }
  if (rankBy === 'scoreTime') {
    if (candidate.score !== entry.score) return candidate.score > entry.score;
    return candidate.timeMs < entry.timeMs;
  }
  return candidate.score > entry.score;
}

export function compareRuns(rankBy, a, b) {
  if (isBetter(rankBy, a, b)) return -1;
  if (isBetter(rankBy, b, a)) return 1;
  return 0;
}
