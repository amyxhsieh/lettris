import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  applyGravity,
  calculateScore,
  branchLetters,
  chooseLetter,
  chooseSpawnColumn,
  createRolls,
  dailySeed,
  dailyWord,
  fallInterval,
  findWordCells,
  isValidWord,
  levelForWords,
  sessionResult,
} from '../src/utils/engine.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const rules = JSON.parse(fs.readFileSync(path.join(root, 'src/generated/rules.json'), 'utf8'));
const fixtures = JSON.parse(fs.readFileSync(path.join(here, 'fixtures/parity.json'), 'utf8'));
const words = new Set(rules.words);
const commonWords = new Set(rules.commonWords || []);

function run(test) {
  const difficulty = rules.difficulties[test.difficultyId];
  switch (test.fn) {
    case 'calculateScore':
      return calculateScore(test.length, test.combo, test.multiplier ?? 1);
    case 'fallInterval':
      return fallInterval(test.level, difficulty);
    case 'levelForWords':
      return levelForWords(test.wordsFound, difficulty.wordsPerLevel);
    case 'chooseLetter':
      return chooseLetter(test.recent, difficulty, test.roll, test.favored || '', test.branch || '');
    case 'branchLetters':
      return branchLetters(test.board, test.cleared, difficulty, rules.words, commonWords);
    case 'chooseSpawnColumn':
      return chooseSpawnColumn(test.grid, difficulty, test.roll);
    case 'findWordCells':
      return findWordCells(test.word, test.grid);
    case 'applyGravity':
      return applyGravity(test.grid);
    case 'isValidWord':
      return isValidWord(test.word, difficulty, words);
    case 'difficultyCount':
      return Object.keys(rules.difficulties).length;
    case 'challenge':
      return rules.challenges[test.challengeId];
    case 'sessionResult':
      return sessionResult(rules.challenges[test.challengeId], test.words, test.elapsedMs, test.toppedOut);
    case 'dailyWord':
      return dailyWord(rules.dailyWords, test.year, test.month, test.day);
    case 'dailySeed':
      return dailySeed(test.year, test.month, test.day);
    case 'rolls': {
      const next = createRolls(test.seed);
      return Array.from({ length: test.count }, () => next());
    }
    default:
      throw new Error(`unknown fixture ${test.fn}`);
  }
}

let failed = 0;
for (const test of fixtures) {
  const actual = run(test);
  if (JSON.stringify(actual) !== JSON.stringify(test.expect)) {
    failed += 1;
    console.error(test.fn, 'expected', test.expect, 'got', actual);
  }
}

if (failed) {
  console.error(`${failed} parity failures`);
  process.exit(1);
}

console.log(`parity ok (${fixtures.length})`);
