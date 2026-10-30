import Cell from './Cell';
import { RULES } from '../utils/dictionary';

const ROWS = RULES.rows;
const COLS = RULES.cols;

function Grid({ grid, falling, clearedCells }) {
  const clearedSet = new Set(
    (clearedCells || []).map(({ row, col }) => `${row},${col}`)
  );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, var(--cell))`,
        gridTemplateRows: `repeat(${ROWS}, var(--cell))`,
        gap: 'var(--gap)',
        padding: 'var(--pad)',
        background: 'rgba(8,8,28,0.85)',
        border: '1px solid rgba(0,200,240,0.2)',
        borderRadius: 6,
        boxShadow: '0 0 30px rgba(0,180,220,0.08), inset 0 0 40px rgba(0,0,0,0.4)',
      }}
    >
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => {
          const isClearing = clearedSet.has(`${row},${col}`);
          const isFallingHere = falling && falling.row === row && falling.col === col;

          let letter = null;

          if (isFallingHere) {
            letter = falling.letter;
          } else if (grid[row] && grid[row][col]) {
            letter = grid[row][col].letter;
          }

          return (
            <Cell
              key={`${row}-${col}`}
              letter={letter}
              isClearing={isClearing}
              isFalling={isFallingHere}
            />
          );
        })
      )}
    </div>
  );
}

export default Grid;
