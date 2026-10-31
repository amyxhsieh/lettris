import { readFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CHALLENGES, HttpError, cleanRun, compareRuns, isBetter } from './boards.js';

const COOLDOWN_MS = 2000;
const FILE = process.env.LETTRIS_DATA_FILE || path.join(process.cwd(), 'data', 'board.json');

function loadLocalEnv() {
  for (const name of ['.env.local', '.env']) {
    let text = '';
    try {
      text = readFileSync(name, 'utf8');
    } catch {
      continue;
    }
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || process.env[key]) continue;
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

export function hasSharedDatabase() {
  return Boolean(databaseUrl());
}

function databaseUrl() {
  const raw = process.env.POSTGRES_URL
    || process.env.DATABASE_URL
    || process.env.POSTGRES_URL_NON_POOLING
    || '';
  if (!raw || raw === '[SENSITIVE]') return '';
  try {
    const url = new URL(raw);
    url.searchParams.delete('pgbouncer');
    url.searchParams.delete('connection_limit');
    return url.toString();
  } catch {
    return raw;
  }
}

function mode() {
  if (databaseUrl()) return 'postgres';
  if (process.env.VERCEL) return 'unconfigured';
  return 'file';
}

let sqlClient = null;
let schemaReady = null;

async function postgres() {
  if (!sqlClient) {
    const { default: postgres } = await import('postgres');
    sqlClient = postgres(databaseUrl(), {
      ssl: 'require',
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 15,
    });
  }
  if (!schemaReady) {
    const sql = sqlClient;
    schemaReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE TABLE IF NOT EXISTS runs (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        player_id TEXT NOT NULL REFERENCES players(id),
        name TEXT NOT NULL,
        score INTEGER NOT NULL,
        words INTEGER NOT NULL,
        level INTEGER NOT NULL,
        difficulty TEXT NOT NULL,
        challenge TEXT NOT NULL,
        time_ms INTEGER NOT NULL,
        ranks BOOLEAN NOT NULL,
        played_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE INDEX IF NOT EXISTS runs_player_played_idx ON runs (player_id, played_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS runs_board_idx ON runs (challenge, difficulty, ranks)`;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
  return sqlClient;
}

let fileQueue = Promise.resolve();

function locked(task) {
  const run = fileQueue.then(task, task);
  fileQueue = run.then(() => {}, () => {});
  return run;
}

async function readFileStore() {
  try {
    const parsed = JSON.parse(await readFile(FILE, 'utf8'));
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.runs)) {
      return { players: {}, runs: [] };
    }
    return { players: parsed.players || {}, runs: parsed.runs };
  } catch (error) {
    if (error && error.code === 'ENOENT') return { players: {}, runs: [] };
    throw error;
  }
}

async function writeFileStore(data) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(data));
}

function publicRun(run) {
  const played = run.playedAt instanceof Date ? run.playedAt : new Date(run.playedAt);
  return {
    name: run.name,
    score: run.score,
    words: run.words,
    level: run.level,
    difficulty: run.difficulty,
    challenge: run.challenge,
    timeMs: run.timeMs,
    date: Number.isNaN(played.getTime()) ? '' : played.toISOString().slice(0, 10),
  };
}

function assertBoard(challenge) {
  if (!CHALLENGES[challenge]) throw new HttpError(400, 'unknown board');
}

function assertCooldown(previousPlayedAt) {
  if (!previousPlayedAt) return;
  const elapsed = Date.now() - Date.parse(previousPlayedAt);
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < COOLDOWN_MS) {
    throw new HttpError(429, 'slow down');
  }
}

export async function readStats() {
  if (mode() === 'unconfigured') throw new HttpError(503, 'database unavailable');
  if (mode() === 'file') {
    const data = await readFileStore();
    return { players: Object.keys(data.players).length, games: data.runs.length };
  }
  const sql = await postgres();
  const rows = await sql`SELECT
    (SELECT COUNT(*)::int FROM players) AS players,
    (SELECT COUNT(*)::int FROM runs) AS games`;
  return { players: Number(rows[0].players) || 0, games: Number(rows[0].games) || 0 };
}

export async function readBoard(challenge) {
  assertBoard(challenge);
  if (mode() === 'unconfigured') throw new HttpError(503, 'database unavailable');
  const rankBy = CHALLENGES[challenge].rankBy;
  if (mode() === 'file') {
    const data = await readFileStore();
    return data.runs
      .filter((run) => run.ranks && run.challenge === challenge)
      .sort((a, b) => compareRuns(rankBy, a, b))
      .slice(0, 10)
      .map(publicRun);
  }
  const sql = await postgres();
  const rows = rankBy === 'time'
    ? await sql`SELECT name, score, words, level, difficulty, challenge, time_ms, played_at
        FROM runs
        WHERE challenge = ${challenge} AND ranks = TRUE
        ORDER BY time_ms ASC, score DESC
        LIMIT 10`
    : await sql`SELECT name, score, words, level, difficulty, challenge, time_ms, played_at
        FROM runs
        WHERE challenge = ${challenge} AND ranks = TRUE
        ORDER BY score DESC
        LIMIT 10`;
  return rows.map((row) => publicRun({
    name: row.name,
    score: Number(row.score),
    words: Number(row.words),
    level: Number(row.level),
    difficulty: row.difficulty,
    challenge: row.challenge,
    timeMs: Number(row.time_ms),
    playedAt: row.played_at,
  }));
}

async function recordInFile(entry) {
  return locked(async () => {
    const data = await readFileStore();
    const previous = [...data.runs].reverse().find((run) => run.playerId === entry.playerId);
    assertCooldown(previous?.playedAt);
    const playedAt = new Date().toISOString();
    data.players[entry.playerId] = { name: entry.name, createdAt: data.players[entry.playerId]?.createdAt || playedAt };
    data.runs.push({ ...entry, playedAt });
    await writeFileStore(data);
    if (!entry.ranks) return { rank: null, ranks: false };
    const better = data.runs.filter((run) => (
      run.ranks
      && run.challenge === entry.challenge
      && isBetter(entry.rankBy, run, entry)
    )).length;
    return { rank: better + 1, ranks: true };
  });
}

async function recordInPostgres(entry) {
  const sql = await postgres();
  const recent = await sql`SELECT played_at FROM runs
    WHERE player_id = ${entry.playerId}
    ORDER BY played_at DESC
    LIMIT 1`;
  assertCooldown(recent[0]?.played_at);
  await sql`INSERT INTO players (id, name)
    VALUES (${entry.playerId}, ${entry.name})
    ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name`;
  await sql`INSERT INTO runs (player_id, name, score, words, level, difficulty, challenge, time_ms, ranks)
    VALUES (
      ${entry.playerId},
      ${entry.name},
      ${entry.score},
      ${entry.words},
      ${entry.level},
      ${entry.difficulty},
      ${entry.challenge},
      ${entry.timeMs},
      ${entry.ranks}
    )`;
  if (!entry.ranks) return { rank: null, ranks: false };
  const rows = entry.rankBy === 'time'
    ? await sql`SELECT COUNT(*)::int AS better FROM runs
        WHERE challenge = ${entry.challenge}
          AND ranks = TRUE
          AND (time_ms < ${entry.timeMs} OR (time_ms = ${entry.timeMs} AND score > ${entry.score}))`
    : await sql`SELECT COUNT(*)::int AS better FROM runs
        WHERE challenge = ${entry.challenge}
          AND ranks = TRUE
          AND score > ${entry.score}`;
  return { rank: Number(rows[0].better) + 1, ranks: true };
}

export async function recordRun(body) {
  if (mode() === 'unconfigured') throw new HttpError(503, 'database unavailable');
  const entry = cleanRun(body);
  if (mode() === 'file') return recordInFile(entry);
  return recordInPostgres(entry);
}
