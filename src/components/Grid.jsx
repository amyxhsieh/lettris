import Cell from './Cell';

const ROWS = 14;
const COLS = 8;

function Grid({ grid, falling, clearedCells }) {
  const clearedSet = new Set(
    (clearedCells || []).map(({ row, col }) => `${row},${col}`)
  );

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLS}, 44px)`,
        gridTemplateRows: `repeat(${ROWS}, 44px)`,
        gap: 3,
        padding: 8,
        background: 'rgba(120,170,220,0.22)',
        border: '2px solid rgba(255,255,255,0.55)',
        borderRadius: 10,
        boxShadow: '0 4px 0 rgba(80,130,190,0.35), inset 0 2px 0 rgba(255,255,255,0.3)',
      }}
    >
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => {
          const isClearing = clearedSet.has(`${row},${col}`);
          const isFallingHere = falling && falling.row === row && falling.col === col;

          let letter = null;
          let color = null;

          if (isFallingHere) {
            letter = falling.letter;
            color = falling.color;
          } else if (grid[row] && grid[row][col]) {
            letter = grid[row][col].letter;
            color = grid[row][col].color;
          }

          return (
            <Cell
              key={`${row}-${col}`}
              letter={letter}
              color={color}
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
