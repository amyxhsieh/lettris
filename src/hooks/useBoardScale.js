import { useLayoutEffect, useState } from 'react';
import { RULES } from '../utils/dictionary';

const ROWS = RULES.rows;
const COLS = RULES.cols;
const MIN_CELL = 26;

function measure(cell) {
  const gap = Math.max(3, Math.round(cell * 0.08));
  const pad = Math.max(8, Math.round(cell * 0.18));
  const gridW = COLS * cell + (COLS - 1) * gap + pad * 2 + 2;
  const gridH = ROWS * cell + (ROWS - 1) * gap + pad * 2 + 2;
  const titleFont = Math.max(30, cell * 0.72);
  const titleH = Math.ceil(titleFont * 1.6) + 8;
  const labelFont = Math.max(10, cell * 0.24);
  const valueFont = Math.max(22, cell * 0.52);
  const statsH = Math.ceil(labelFont * 1.6 + valueFont * 1.45) + 26;
  const inputH = Math.max(42, cell * 0.95) + 16;
  const hintFont = Math.max(10, cell * 0.22);
  const hintH = Math.ceil(hintFont * 2) + 8;
  const totalH = titleH + statsH + gridH + inputH + hintH;
  return { cell, gap, pad, gridW, gridH, totalH };
}

export function boardMetrics(width, height) {
  const maxH = height - 56;
  const maxW = width - 48;
  let best = measure(MIN_CELL);
  let lo = MIN_CELL;
  let hi = 96;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const next = measure(mid);
    if (next.totalH <= maxH && next.gridW <= maxW) {
      best = next;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return best;
}

export function useBoardScale(columnRef) {
  const [metrics, setMetrics] = useState(() => (
    typeof window === 'undefined'
      ? measure(34)
      : boardMetrics(window.innerWidth, window.innerHeight)
  ));

  useLayoutEffect(() => {
    const update = () => setMetrics(boardMetrics(window.innerWidth, window.innerHeight));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useLayoutEffect(() => {
    const node = columnRef?.current;
    if (!node) return;
    const available = window.innerHeight - 48;
    const used = node.getBoundingClientRect().height;
    if (used <= available + 1 || metrics.cell <= MIN_CELL) return;
    const nextCell = Math.max(MIN_CELL, Math.floor(metrics.cell * (available / used)));
    if (nextCell < metrics.cell) setMetrics(measure(nextCell));
  });

  return metrics;
}
