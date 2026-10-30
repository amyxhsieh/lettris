// Each letter gets a consistent color based on char code using HSL
export function getLetterColor(letter) {
  if (!letter) return '#333355';
  const charCode = letter.toUpperCase().charCodeAt(0);
  // A=65, Z=90 => map to hue 0-360 with spread
  const hue = ((charCode - 65) * (360 / 26) + 20) % 360;
  return `hsl(${hue}, 90%, 65%)`;
}

export function getLetterGlow(letter) {
  if (!letter) return 'none';
  const charCode = letter.toUpperCase().charCodeAt(0);
  const hue = ((charCode - 65) * (360 / 26) + 20) % 360;
  return `0 0 8px hsl(${hue}, 100%, 70%), 0 0 16px hsl(${hue}, 100%, 50%)`;
}
