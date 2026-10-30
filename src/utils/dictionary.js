import rules from '../generated/rules.json';
import { createEngine } from './engine';

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
};

export function isValidWord(word, difficultyId = 'medium') {
  return engine.isValidWord(word, difficultyId);
}

export function canFormWord(word, grid) {
  return engine.canFormWord(word, grid);
}

export function findWordCells(word, grid) {
  return engine.findWordCells(word, grid);
}
