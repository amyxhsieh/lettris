const cache = {};

export function playSound(path) {
  if (!cache[path]) {
    cache[path] = new Audio(path);
  }
  const audio = cache[path];
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

export const clickSound = () => playSound('/sound/click_button.wav');

const PAGE_TRACK = '/sound/bgm.m4a';
const TRACKS = [
  '/sound/bgm.m4a',
  '/sound/gm1.m4a',
  '/sound/gm2.m4a',
  '/sound/gm3.m4a',
  '/sound/gm4.m4a',
  '/sound/gm5.m4a',
  '/sound/gm6.m4a',
];

const LEVEL = 0.5;
const FADE_MS = 700;

const slots = [null, null];
const slotSrc = ['', ''];
let active = 0;
let currentSrc = '';
let held = false;
let wanted = false;
let unlockArmed = false;
let fadeToken = 0;

function slot(index) {
  if (!slots[index]) {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0;
    audio.preload = 'auto';
    slots[index] = audio;
  }
  return slots[index];
}

function fadeTo(audio, target, ms, token, pauseAtZero = false) {
  const done = () => {
    audio.volume = target;
    if (target === 0 && (pauseAtZero || audio !== slots[active])) audio.pause();
  };
  const from = audio.volume;
  if (Math.abs(from - target) < 0.01) {
    done();
    return;
  }
  const start = performance.now();
  const step = (now) => {
    if (token !== fadeToken) return;
    const t = Math.min(1, (now - start) / ms);
    const eased = t * t * (3 - 2 * t);
    audio.volume = from + (target - from) * eased;
    if (t < 1) {
      requestAnimationFrame(step);
      return;
    }
    done();
  };
  requestAnimationFrame(step);
}

function beginCrossfade(incoming, outgoing, token) {
  if (token !== fadeToken || held) return;
  fadeTo(incoming, LEVEL, FADE_MS, token);
  if (outgoing && outgoing !== incoming) fadeTo(outgoing, 0, FADE_MS, token);
}

function playThenFade(incoming, outgoing, token) {
  incoming.volume = 0;
  const pending = incoming.play();
  if (pending && typeof pending.then === 'function') {
    pending.then(() => beginCrossfade(incoming, outgoing, token)).catch(() => {});
    return;
  }
  beginCrossfade(incoming, outgoing, token);
}

function transitionTo(src, restart) {
  const playing = slots[active];
  if (playing && currentSrc === src && !restart) {
    if (!held && playing.paused) playing.play().catch(() => {});
    return;
  }

  const token = ++fadeToken;
  const outgoing = playing && currentSrc ? playing : null;
  const next = outgoing ? 1 - active : 0;
  const incoming = slot(next);
  if (slotSrc[next] !== src) {
    incoming.src = src;
    slotSrc[next] = src;
  }
  incoming.pause();
  incoming.volume = 0;
  try { incoming.currentTime = 0; } catch { /* metadata not in yet */ }
  currentSrc = src;
  active = next;

  if (held) {
    if (outgoing && outgoing !== incoming) {
      outgoing.pause();
      outgoing.volume = 0;
    }
    return;
  }
  playThenFade(incoming, outgoing, token);
}

function armUnlock() {
  if (unlockArmed || typeof window === 'undefined') return;
  unlockArmed = true;
  const start = () => {
    window.removeEventListener('pointerdown', start);
    window.removeEventListener('keydown', start);
    if (!wanted || held) return;
    const audio = slots[active];
    if (!audio || !audio.paused) return;
    const other = slots[1 - active];
    playThenFade(audio, other && !other.paused ? other : null, fadeToken);
  };
  window.addEventListener('pointerdown', start);
  window.addEventListener('keydown', start);
}

export function playPageMusic() {
  wanted = true;
  held = false;
  armUnlock();
  transitionTo(PAGE_TRACK, false);
}

export function playGameMusic() {
  wanted = true;
  held = false;
  armUnlock();
  const pick = TRACKS[Math.floor(Math.random() * TRACKS.length)];
  transitionTo(pick, true);
}

export function shuffleGameMusic() {
  if (!wanted) return;
  const pool = TRACKS.filter((track) => track !== currentSrc);
  const pick = pool[Math.floor(Math.random() * pool.length)];
  transitionTo(pick, true);
}

export function pauseMusic() {
  held = true;
  fadeToken += 1;
  slots.forEach((audio, index) => {
    if (!audio) return;
    audio.pause();
    if (index !== active) audio.volume = 0;
  });
}

export function resumeMusic() {
  held = false;
  if (!wanted) return;
  const audio = slots[active];
  if (!audio) return;
  const quiet = audio.volume < LEVEL - 0.02;
  audio.play().catch(() => {});
  if (quiet) fadeTo(audio, LEVEL, FADE_MS, ++fadeToken);
}

export function fadeOutMusic() {
  wanted = false;
  held = false;
  const token = ++fadeToken;
  const audio = slots[active];
  currentSrc = '';
  if (!audio) return;
  fadeTo(audio, 0, FADE_MS, token, true);
}

export function stopMusic() {
  wanted = false;
  held = false;
  fadeToken += 1;
  currentSrc = '';
  slots.forEach((audio) => {
    if (!audio) return;
    audio.pause();
    audio.volume = 0;
    try { audio.currentTime = 0; } catch { /* ignore */ }
  });
}
