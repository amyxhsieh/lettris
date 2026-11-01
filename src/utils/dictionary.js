import rules from '../generated/rules.json';
import { createEngine, utcToday } from './engine';

export const RULES = rules;
export const engine = createEngine(rules);

export const MODE_COLOR = {
  easy: '#33ff66',
  medium: '#00ddff',
  hard: '#ff66aa',
};

export const CHALLENGE_COLOR = {
  survival: '#00ddff',
  words: '#33ff66',
  timed: '#ffaa44',
  daily: '#ffd56a',
};

export function todayDaily(now = new Date()) {
  const parts = utcToday(now);
  return {
    ...parts,
    word: engine.dailyWord(parts.year, parts.month, parts.day),
  };
}

export function isValidWord(word, difficultyId = 'medium', minLength = null) {
  return engine.isValidWord(word, difficultyId, minLength);
}

export function canFormWord(word, grid) {
  return engine.canFormWord(word, grid);
}

export function findWordCells(word, grid) {
  return engine.findWordCells(word, grid);
}
