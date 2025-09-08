declare module "canvas-confetti" {
  type ConfettiOptions = {
    particleCount?: number;
    startVelocity?: number;
    spread?: number;
    ticks?: number;
    zIndex?: number;
    origin?: { x?: number; y?: number };
    angle?: number;
    gravity?: number;
    scalar?: number;
    shapes?: Array<"square" | "circle">;
    colors?: string[];
  };

  interface ConfettiFunction {
    (options?: ConfettiOptions): void;
    reset?: () => void;
  }

  const confetti: ConfettiFunction;
  export default confetti;
}


