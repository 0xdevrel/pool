"use client";

import { useState, useEffect, useCallback } from "react";
import { SudokuGrid } from "./SudokuGrid";
import { NumberPad } from "./NumberPad";
import { MiniKit, tokenToDecimals, Tokens, PayCommandInput, MiniAppPaymentSuccessPayload } from "@worldcoin/minikit-js";

interface SudokuGameProps {
  onGameEnd: () => void;
}

type Grid = (number | null)[][];
type BooleanGrid = boolean[][];

// Sudoku puzzle generator and solver
class SudokuGenerator {
  private grid: Grid;

  constructor() {
    this.grid = Array(9).fill(null).map(() => Array(9).fill(null));
  }

  // Check if a number is valid in a given position
  private isValid(grid: Grid, row: number, col: number, num: number): boolean {
    // Check row
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num) return false;
    }

    // Check column
    for (let i = 0; i < 9; i++) {
      if (grid[i][col] === num) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = boxRow; i < boxRow + 3; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        if (grid[i][j] === num) return false;
      }
    }

    return true;
  }

  // Solve the grid using backtracking
  private solve(grid: Grid): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === null) {
          const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          
          for (const num of numbers) {
            if (this.isValid(grid, row, col, num)) {
              grid[row][col] = num;
              
              if (this.solve(grid)) {
                return true;
              }
              
              grid[row][col] = null;
            }
          }
          
          return false;
        }
      }
    }
    return true;
  }

  // Generate a complete solved grid
  private generateComplete(): Grid {
    const grid: Grid = Array(9).fill(null).map(() => Array(9).fill(null));
    this.solve(grid);
    return grid;
  }

  // Remove numbers to create a puzzle
  private createPuzzle(completeGrid: Grid, difficulty: 'easy' | 'medium' | 'hard' = 'medium'): { puzzle: Grid; solution: Grid } {
    const puzzle = completeGrid.map(row => [...row]);
    const solution = completeGrid.map(row => [...row]);
    
    // Number of cells to remove based on difficulty
    const cellsToRemove = {
      easy: 40,
      medium: 50,
      hard: 60
    }[difficulty];

    const positions = [];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        positions.push([i, j]);
      }
    }
    
    // Shuffle positions
    positions.sort(() => Math.random() - 0.5);
    
    // Remove cells
    for (let i = 0; i < cellsToRemove && i < positions.length; i++) {
      const [row, col] = positions[i];
      puzzle[row][col] = null;
    }

    return { puzzle, solution };
  }

  // Main method to generate a new puzzle
  generatePuzzle(difficulty: 'easy' | 'medium' | 'hard' = 'medium') {
    const completeGrid = this.generateComplete();
    return this.createPuzzle(completeGrid, difficulty);
  }
}

export const SudokuGame = ({ onGameEnd }: SudokuGameProps) => {
  const [grid, setGrid] = useState<Grid>(() => Array(9).fill(null).map(() => Array(9).fill(null)));
  const [solution, setSolution] = useState<Grid>(() => Array(9).fill(null).map(() => Array(9).fill(null)));
  const [fixedCells, setFixedCells] = useState<BooleanGrid>(() => Array(9).fill(null).map(() => Array(9).fill(false)));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [errors, setErrors] = useState<BooleanGrid>(() => Array(9).fill(null).map(() => Array(9).fill(false)));
  const [gameComplete, setGameComplete] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>("medium");
  const [mistakes, setMistakes] = useState(0);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [gameOverReason, setGameOverReason] = useState<"mistakes" | "hints" | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccessOpen, setPaymentSuccessOpen] = useState(false);

  const continueAddress = "0xDd2a0c0EA69A77a99779f611A5cB97c63b215124";

  // Removed custom type guard - following official docs pattern exactly

  const handlePayToContinue = useCallback(async (token: Tokens) => {
    try {
      setIsPaying(true);
      setPaymentError(null);

      if (!MiniKit.isInstalled()) {
        setPaymentError("Please open this app in World App to continue.");
        return;
      }

      // 1) Create a backend-issued reference for this payment
      const initRes = await fetch("/api/initiate-payment", { method: "POST", credentials: "include" });
      if (!initRes.ok) {
        const msg = await initRes.text().catch(() => null);
        setPaymentError(msg || "Unable to initiate payment. Please try again.");
        return;
      }
      const { id } = await initRes.json();

      // 2) Build the Pay payload
      const payload: PayCommandInput = {
        reference: id,
        to: continueAddress,
        tokens: [
          {
            symbol: token,
            token_amount: tokenToDecimals(0.2, token).toString(),
          },
        ],
        description: "Second chance: continue Sudoku",
        // network: Network.WorldChain, // Optional but recommended
      };

      // 3) Execute payment in World App
      const { finalPayload } = await MiniKit.commandsAsync.pay(payload);

      // Handle different payment statuses - follow official docs pattern
      if (finalPayload.status == 'success') {
        // 4) Confirm payment on backend (optimistic)
        const confirmRes = await fetch("/api/confirm-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            payload: finalPayload as MiniAppPaymentSuccessPayload 
          }),
          credentials: "include",
        });
        const confirm = await confirmRes.json().catch(() => ({}));
        if (confirmRes.ok && confirm?.success) {
          // Resume the same game: keep grid/solution as-is; reset limits
          setGameOver(false);
          setGameOverReason(null);
          setMistakes(0);
          setHintsRemaining(3);
          // Show success modal briefly, allow manual dismiss as well
          setPaymentSuccessOpen(true);
          setTimeout(() => setPaymentSuccessOpen(false), 1800);
          return;
        }
        const serverErr = confirm?.error || (await confirmRes.text().catch(() => ""));
        if (serverErr) {
          setPaymentError(`Payment verification failed: ${serverErr}`);
          return;
        }
      } else {
        // Handle non-success responses (error, cancelled, etc.)
        const response = finalPayload as { status?: string; error?: string };
        if (response.status === 'error') {
          const errorMsg = response.error || 'Payment failed in World App';
          setPaymentError(`Payment error: ${errorMsg}`);
          return;
        } else if (response.status === 'cancelled') {
          setPaymentError("Payment was cancelled. Please try again.");
          return;
        }
      }

      setPaymentError("Payment not completed. Please try again.");
    } catch (e) {
      setPaymentError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setIsPaying(false);
    }
  }, [continueAddress]);

  // Initialize a new game
  const initializeGame = useCallback(() => {
    const generator = new SudokuGenerator();
    const { puzzle, solution: newSolution } = generator.generatePuzzle(difficulty);
    
    setGrid(puzzle);
    setSolution(newSolution);
    
    // Mark fixed cells
    const fixed = puzzle.map(row => row.map(cell => cell !== null));
    setFixedCells(fixed);
    
    setErrors(Array(9).fill(null).map(() => Array(9).fill(false)));
    setSelectedCell(null);
    setGameComplete(false);
    setGameOver(false);
    setTimeElapsed(0);
    setGameStarted(true);
    setMistakes(0);
    setHintsRemaining(3);
    setGameOverReason(null);
  }, [difficulty]);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Timer effect
  useEffect(() => {
    if (!gameStarted || gameComplete || gameOver) return;

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameComplete, gameOver]);

  // Celebrate with confetti when the puzzle is completed
  useEffect(() => {
    if (!gameComplete) return;
    let isCancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const fireConfetti = async () => {
      try {
        const mod = await import("canvas-confetti");
        if (isCancelled) return;
        const confetti = mod.default;

        const durationMs = 2000;
        const animationEnd = Date.now() + durationMs;
        const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 1000 } as const;

        intervalId = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) {
            if (intervalId) clearInterval(intervalId);
            return;
          }
          const particleCount = Math.max(40, Math.floor(120 * (timeLeft / durationMs)));
          // Left burst
          confetti({
            ...defaults,
            particleCount,
            origin: { x: Math.random() * 0.2 + 0.1, y: Math.random() * 0.2 + 0.1 },
          });
          // Right burst
          confetti({
            ...defaults,
            particleCount,
            origin: { x: Math.random() * 0.2 + 0.7, y: Math.random() * 0.2 + 0.1 },
          });
        }, 250);
      } catch {
        // no-op if module unavailable
      }
    };

    fireConfetti();
    return () => {
      isCancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [gameComplete]);

  // Validate the current grid state
  const validateGrid = useCallback((currentGrid: Grid): BooleanGrid => {
    const newErrors: BooleanGrid = Array(9).fill(null).map(() => Array(9).fill(false));

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = currentGrid[row][col];
        if (value === null) continue;

        // Check for duplicates in row
        for (let i = 0; i < 9; i++) {
          if (i !== col && currentGrid[row][i] === value) {
            newErrors[row][col] = true;
            newErrors[row][i] = true;
          }
        }

        // Check for duplicates in column
        for (let i = 0; i < 9; i++) {
          if (i !== row && currentGrid[i][col] === value) {
            newErrors[row][col] = true;
            newErrors[i][col] = true;
          }
        }

        // Check for duplicates in 3x3 box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let i = boxRow; i < boxRow + 3; i++) {
          for (let j = boxCol; j < boxCol + 3; j++) {
            if ((i !== row || j !== col) && currentGrid[i][j] === value) {
              newErrors[row][col] = true;
              newErrors[i][j] = true;
            }
          }
        }
      }
    }

    return newErrors;
  }, []);

  // Check if the game is complete
  const checkGameComplete = useCallback((currentGrid: Grid): boolean => {
    // All cells must match the solution
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (currentGrid[row][col] === null) return false;
        if (solution[row][col] === null) return false;
        if (currentGrid[row][col] !== solution[row][col]) return false;
      }
    }
    return true;
  }, [solution]);

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (gameComplete || fixedCells[row][col]) return;
    setSelectedCell([row, col]);
  };

  // Handle number selection
  const handleNumberSelect = (number: number | null) => {
    if (!selectedCell || gameComplete || gameOver) return;

    const [row, col] = selectedCell;
    if (fixedCells[row][col]) return;

    const newGrid = grid.map((gridRow, rowIndex) =>
      gridRow.map((cell, colIndex) =>
        rowIndex === row && colIndex === col ? number : cell
      )
    );

    setGrid(newGrid);

    // Validate and check for completion
    const newErrors = validateGrid(newGrid);
    const mismatch = number !== null && solution[row][col] !== null && number !== solution[row][col];
    if (mismatch) {
      newErrors[row][col] = true;
    }
    setErrors(newErrors);

    // Count mistake if the chosen number does not match the solution
    if (mismatch) {
      setMistakes(prev => {
        const next = prev + 1;
        if (next >= 3) {
          setGameOver(true);
          setGameOverReason("mistakes");
        }
        return next;
      });
    }

    if (checkGameComplete(newGrid)) {
      setGameComplete(true);
      setTimeout(() => {
        onGameEnd();
      }, 2000);
    }
  };

  // Use a hint by filling the currently selected cell with the correct value
  const handleHint = () => {
    if (!selectedCell || gameComplete || gameOver || hintsRemaining <= 0) return;
    const [row, col] = selectedCell;
    if (fixedCells[row][col]) return;

    const correctValue = solution[row][col];
    if (correctValue === null) return;

    const newGrid = grid.map((gridRow, rowIndex) =>
      gridRow.map((cell, colIndex) =>
        rowIndex === row && colIndex === col ? correctValue : cell
      )
    );
    setGrid(newGrid);

    const newErrors = validateGrid(newGrid);
    setErrors(newErrors);

    setHintsRemaining(prev => {
      const next = Math.max(0, prev - 1);
      if (next <= 0) {
        setGameOver(true);
        setGameOverReason("hints");
      }
      return next;
    });

    if (checkGameComplete(newGrid)) {
      setGameComplete(true);
      setTimeout(() => {
        onGameEnd();
      }, 2000);
    }
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="sudoku-game">
      {/* Top Bar */}
      <div className="game-topbar">
        <div className="left-controls">
          <div className="difficulty-select">
            <label htmlFor="difficulty">Difficulty</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
        <div className="center-title"></div>
        <div className="right-controls">
          <button className="topbar-button emph" onClick={initializeGame}>New Game</button>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="game-stats-row">
        <div className="stat-item">
          <span className="stat-label">Time</span>
          <span className="stat-value">{formatTime(timeElapsed)}</span>
        </div>
        <div className={`stat-item ${mistakes > 0 ? 'danger' : ''}`}>
          <span className="stat-label">Mistakes</span>
          <span className="stat-value">{mistakes}/3</span>
        </div>
        <div className={`stat-item ${hintsRemaining < 3 ? 'warning' : ''}`}>
          <span className="stat-label">Hints</span>
          <span className="stat-value">{hintsRemaining}/3</span>
        </div>
      </div>

      {/* Game Complete Modal */}
      {gameComplete && (
        <div className="game-complete-modal">
          <div className="modal-content">
            <div className="success-icon">✓</div>
            <h2>Complete</h2>
            <p>Finished in {formatTime(timeElapsed)}</p>
            <button 
              className="new-game-button"
              onClick={initializeGame}
            >
              New Puzzle
            </button>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {paymentSuccessOpen && (
        <div className="game-complete-modal">
          <div className="modal-content">
            <div className="success-icon">✓</div>
            <h2>Payment Successful</h2>
            <p>You can continue playing.</p>
            <button 
              className="new-game-button"
              onClick={() => setPaymentSuccessOpen(false)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameOver && !gameComplete && (
        <div className="game-complete-modal">
          <div className="modal-content">
            <div className="success-icon">✕</div>
            <h2>Game Over</h2>
            <p>{gameOverReason === "hints" ? "Used 3 hints" : "Reached 3 mistakes"}</p>
            <p style={{ marginBottom: "0.75rem", color: "var(--secondary)", fontWeight: 600 }}>
              Pay to continue
            </p>
            {paymentError && (
              <div className="error-message" style={{ marginBottom: "0.75rem" }}>
                ⚠️ {paymentError}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <button
                className="pay-button"
                onClick={() => handlePayToContinue(Tokens.USDC)}
                disabled={isPaying}
              >
                {isPaying ? (
                  <span className="verify-loading"><span className="loading-spinner small"></span> Processing...</span>
                ) : (
                  <span>Pay 0.2 USDC</span>
                )}
              </button>
              <button
                className="pay-button"
                onClick={() => handlePayToContinue(Tokens.WLD)}
                disabled={isPaying}
              >
                {isPaying ? (
                  <span className="verify-loading"><span className="loading-spinner small"></span> Processing...</span>
                ) : (
                  <span>Pay 0.2 WLD</span>
                )}
              </button>
            </div>
            <button 
              className="new-game-button"
              onClick={initializeGame}
            >
              New Puzzle
            </button>
          </div>
        </div>
      )}

      {/* Sudoku Grid */}
      <SudokuGrid
        grid={grid}
        fixedCells={fixedCells}
        selectedCell={selectedCell}
        errors={errors}
        onCellClick={handleCellClick}
      />

      {/* Number Pad */}
      <NumberPad
        onNumberSelect={handleNumberSelect}
        onHint={handleHint}
        disabled={gameComplete || gameOver}
        hintsRemaining={hintsRemaining}
      />


    </div>
  );
};
