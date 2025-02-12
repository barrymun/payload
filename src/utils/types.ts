export type MovementKeys = "ArrowLeft" | "ArrowUp" | "ArrowRight" | "ArrowDown";
export type Direction = "left" | "right" | "up" | "down";
export type MiningDirection = Exclude<Direction, "up">;
