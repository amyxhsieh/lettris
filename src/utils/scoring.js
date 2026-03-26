export function getComboMultiplier(combo) {
  if (combo >= 4) return 2.5;
  if (combo === 3) return 2.0;
  if (combo === 2) return 1.5;
  return 1.0;
}

export function calculateScore(wordLength, combo) {
  const base = wordLength * wordLength * 10;
  const multiplier = getComboMultiplier(combo);
  return Math.round(base * multiplier);
}
