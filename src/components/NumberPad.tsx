"use client";

interface NumberPadProps {
  onNumberSelect: (number: number | null) => void;
  onHint: () => void;
  disabled: boolean;
  hintsRemaining?: number;
}

export const NumberPad = ({ onNumberSelect, onHint, disabled, hintsRemaining }: NumberPadProps) => {
  const firstRow = [1, 2, 3, 4, 5];
  const secondRow = [6, 7, 8, 9];

  return (
    <div className="number-pad">
      <div className="number-grid">
        {/* First row: 1-5 */}
        <div className="number-row">
          {firstRow.map((n) => (
            <button
              key={n}
              className="number-button"
              onClick={() => onNumberSelect(n)}
              disabled={disabled}
              type="button"
            >
              {n}
            </button>
          ))}
        </div>

        {/* Second row: 6-9 + Clear */}
        <div className="number-row">
          {secondRow.map((n) => (
            <button
              key={n}
              className="number-button"
              onClick={() => onNumberSelect(n)}
              disabled={disabled}
              type="button"
            >
              {n}
            </button>
          ))}
          <button
            className="number-button"
            onClick={() => onNumberSelect(null)}
            disabled={disabled}
            type="button"
            aria-label="Clear cell"
            title="Clear"
          >
            ⌫
          </button>
        </div>

        {/* Actions: Hint */}
        <div className="number-actions-row">
          <button className="action-button hint" onClick={onHint} disabled={disabled} type="button">
            💡 Hint{typeof hintsRemaining === 'number' ? ` (${hintsRemaining})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
};
 