# Lettris

**Tetris meets word game.** Letters fall from the sky — you move them into place, then type a word to clear them. Simple idea, surprisingly hard to put down.

Play at [lettris-game.vercel.app](https://lettris-game.vercel.app/).

---

## Game demo

<img src="public/Demo.gif" width="50%" />

---

## How it works

Letters drop one at a time into a 13×8 grid. On the menu, ↑ and ↓ choose the mode and Enter confirms it. ← and → choose the difficulty and Enter confirms it. Enter again starts the game. Survival and Daily skip the difficulty. A 3-second countdown runs before the first letter, the clock, and the game music.

**Letters**

Vowels are cyan. Consonants are green.

**Clear**

Type a word, then press Enter. Those letters leave the board.

Easy and Medium need 3 letters or more. Hard needs 4 or more. A word can be as long as the board. Ordinary short words count, including **cue**, **did**, **git**, **gin**, and **zen**. Days, months, and one-word place names count. A contraction clears without the apostrophe, so **don't** clears as **dont**. A chopped piece of a longer word does not clear, so **gues** does not, while **guest** and **guess** do.

**Score**

Clear words quickly to build a combo. The same word scores full, then half, then a quarter. Easy scores ×1, Medium ×2, and Hard ×3.

After a clear, the next letters lean toward a different word. The game looks at the letters still on the board and raises up to three letters that would finish another common word. Easy aims at words of 3 or 4 letters, Medium up to 6, and Hard at words of 5 to 8. The letters from the word you just cleared stay at their normal rate, so the same word is not simply rebuilt. On Daily, today's word keeps its own boost on top of that.

**Modes**

| Mode | How it plays |
|------|----------------|
| Survival | Play until the board fills. No difficulty choice. Level 5 needs 4 letters. Level 10 needs 5. A notice appears at each of those levels. Drops start faster than Easy and keep speeding up |
| 60 Words | Clear 60 words. A run that fills early does not rank. Best score wins. A faster time breaks a tie |
| 3 Minutes | The clock ends at 0:00. Filling the board early still ranks |
| Daily | Everyone shares the same 4-letter word, on Medium. Clear it the most times. Score breaks a tie. Other words still clear. The board resets at midnight UTC |

**Difficulties**

| | Letters | Score |
|--|---------|-------|
| Easy | Common letters, words from 3 letters | ×1 |
| Medium | A normal mix, words from 3 letters | ×2 |
| Hard | Rarer letters, words from 4 letters | ×3 |

Survival uses the Easy letter mix and scores at ×1.

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
- Clearing the same word again in a run scores half, then a quarter. The letters still clear
- Clear words quickly back-to-back to build a **combo** (×1, ×1.5, ×2, up to ×2.5)
- The same word is worth twice as much on Medium and three times as much on Hard

---

## Features

- 🏆 Shared leaderboard — one board per mode. Survival and 3 Minutes rank by score. 60 Words ranks by score, then by the faster time. Daily ranks by how many times today's word was cleared, then by score. 60 Words, 3 Minutes, and Daily runs are marked Easy, Medium, or Hard
- 👤 Name entry — enter once, remembered on this browser. Skipping the name still ranks, as `PLAYER` plus a number from this browser
- 🎵 Background music with fade in and out, plus sound effects
- Pixel art background with shooting stars on the start screen
- Combo animations, word clear animations

---

## Running locally

```bash
npm install
npm run dev
```
