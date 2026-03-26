// Letter frequency pool matching English distribution
// More common letters appear more times in the pool
const LETTER_POOL = [
  // Very high frequency
  'E','E','E','E','E','E','E','E','E','E','E','E',
  'T','T','T','T','T','T','T','T','T',
  'A','A','A','A','A','A','A','A',
  'O','O','O','O','O','O','O','O',
  'I','I','I','I','I','I','I',
  'N','N','N','N','N','N','N',
  'S','S','S','S','S','S',
  'H','H','H','H','H','H',
  'R','R','R','R','R','R',
  // High frequency
  'D','D','D','D',
  'L','L','L','L',
  'C','C','C','C',
  'U','U','U','U',
  'M','M','M','M',
  'W','W','W',
  'F','F','F',
  'G','G','G',
  'Y','Y','Y',
  'P','P','P',
  'B','B','B',
  // Medium frequency
  'V','V',
  'K','K',
  'J','J',
  'X',
  'Q',
  'Z',
];

export function getRandomLetter() {
  return LETTER_POOL[Math.floor(Math.random() * LETTER_POOL.length)];
}

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
