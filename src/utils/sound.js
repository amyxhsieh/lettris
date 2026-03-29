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

// ── BGM ───────────────────────────────────────────────────────────────────
let bgm = null;

export function startBGM() {
  if (!bgm) {
    bgm = new Audio('/sound/bgm.mp3');
    bgm.loop = true;
    bgm.volume = 0.5;
  }
  bgm.currentTime = 0;
  bgm.play().catch(() => {});
}

export function stopBGM() {
  if (bgm) {
    bgm.pause();
    bgm.currentTime = 0;
  }
}
