import Cell from './Cell';

const ROWS = 14;
const COLS = 8;

function Grid({ grid, falling, clearedCells }) {
  // Build a set for quick lookup of cleared cells
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
        background: 'rgba(10,10,30,0.8)',
        border: '1px solid #2a2a5a',
        borderRadius: 8,
        boxShadow: '0 0 30px rgba(80,80,200,0.15), inset 0 0 30px rgba(0,0,0,0.3)',
      }}
    >
      {Array.from({ length: ROWS }, (_, row) =>
        Array.from({ length: COLS }, (_, col) => {
          const isClearing = clearedSet.has(`${row},${col}`);

          // Check if falling letter occupies this cell
          const isFallingHere =
            falling &&
            falling.row === row &&
            falling.col === col;

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
