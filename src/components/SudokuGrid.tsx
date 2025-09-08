"use client";

import { SudokuCell } from "./SudokuCell";

interface SudokuGridProps {
  grid: (number | null)[][];
  fixedCells: boolean[][];
  selectedCell: [number, number] | null;
  errors: boolean[][];
  onCellClick: (row: number, col: number) => void;
}

export const SudokuGrid = ({
  grid,
  fixedCells,
  selectedCell,
  errors,
  onCellClick,
}: SudokuGridProps) => {
  const isHighlighted = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    
    const [selectedRow, selectedCol] = selectedCell;
    
    // Highlight same row, column, or 3x3 box
    const sameRow = row === selectedRow;
    const sameCol = col === selectedCol;
    const sameBox = 
      Math.floor(row / 3) === Math.floor(selectedRow / 3) &&
      Math.floor(col / 3) === Math.floor(selectedCol / 3);
    
    return sameRow || sameCol || sameBox;
  };

  return (
    <div className="sudoku-container">
      <div className="sudoku-grid">
        {grid.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <SudokuCell
              key={`${rowIndex}-${colIndex}`}
              value={value}
              isFixed={fixedCells[rowIndex][colIndex]}
              isSelected={
                selectedCell !== null &&
                selectedCell[0] === rowIndex &&
                selectedCell[1] === colIndex
              }
              isHighlighted={isHighlighted(rowIndex, colIndex)}
              isError={errors[rowIndex][colIndex]}
              row={rowIndex}
              col={colIndex}
              onCellClick={onCellClick}
            />
          ))
        )}
      </div>
    </div>
  );
};
