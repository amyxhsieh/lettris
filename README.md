# Lettris

**Tetris meets word game.** Letters fall from the sky — you move them into place, then type a word to clear them. Simple idea, surprisingly hard to put down.

---

## Game demo

<img src="public/Demo.gif" width="50%" />

---

## How it works

Letters drop one at a time into a 13×8 grid. Pick a mode, then a difficulty, then start. A 3-second countdown runs before the first letter, the clock, and the game music. Use the arrow keys to position letters, then type any word you can spot on the board and hit Enter to clear those letters. The grid fills up faster as you level up, so you'll need to think and type quickly.

**Modes**

| Mode | How it ends |
|------|-------------|
| Survival | Play until the board fills |
| 50 Words | Clear 50 words. A run that fills early does not rank |
| 3 Minutes | Score until the clock hits 0:00. Filling the board early still ranks |

**Difficulties**

| | Letters | Score |
|--|---------|-------|
| Easy | Common letters, words from 3 letters | ×1 |
| Medium | A normal mix, words from 3 letters | ×2 |
| Hard | Rarer letters, words from 4 letters | ×3 |

A word can be as long as the board. Easy and Medium clear from 3 letters, including ordinary words such as **cue**, **did**, and **gin**. Hard clears from 4. Days, months, and one-word place names count. A contraction clears without the apostrophe, so **don't** clears as **dont**.

**Vowels** show up in cyan, **consonants** in green.

**Controls**

| Key | Action |
|-----|--------|
| `← →` | Move falling letter |
| `↓` | Speed up |
| `Space` | Hard drop |
| Any letter | Start typing a word |
| `Backspace` | Delete last letter |
| `Enter` | Submit word |
| `Esc` | Pause / resume |

No clicking required to switch between moving and typing — just start typing and it works. Pause freezes the clock and the music.

Hold **QUIT** (top left) to leave. A short press stays in the game, and quitting does not save the run. **BGM** (bottom right) shuffles the track. Music fades between the homepage, the countdown, and the game.

---

## Scoring

- Longer words score more: length² × 10, then the combo, then the difficulty multiplier
- Clear words quickly back-to-back to build a **combo** (×1, ×1.5, ×2, up to ×2.5)
- The same word is worth twice as much on Medium and three times as much on Hard

---

## Features

- 🏆 Shared leaderboard — one board per mode, ranked by score, with each run marked Easy, Medium, or Hard
- 👤 Name entry — enter once, remembered on this browser
- 🎵 Background music with fade in and out, plus sound effects
- Pixel art background with shooting stars on the start screen
- Combo animations, word clear animations

---

## Running locally

```bash
npm install
npm run dev
```
