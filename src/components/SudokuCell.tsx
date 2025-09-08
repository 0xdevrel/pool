"use client";

interface SudokuCellProps {
  value: number | null;
  isFixed: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isError: boolean;
  row: number;
  col: number;
  onCellClick: (row: number, col: number) => void;
}

export const SudokuCell = ({
  value,
  isFixed,
  isSelected,
  isHighlighted,
  isError,
  row,
  col,
  onCellClick,
}: SudokuCellProps) => {
  const handleClick = () => {
    if (!isFixed) {
      onCellClick(row, col);
    }
  };

  const cellClasses = [
    "sudoku-cell",
    isFixed && "fixed",
    isSelected && "selected",
    isHighlighted && "highlighted",
    isError && "error",
  ].filter(Boolean).join(" ");

  return (
    <button
      className={cellClasses}
      onClick={handleClick}
      disabled={isFixed}
      type="button"
    >
      {value ? value : ""}
    </button>
  );
};
