/**
 * Clamps a value between a minimum and maximum value
 * @param min the minimum value
 * @param value the ideal value
 * @param max the maximum value
 * @returns the value clamped between the min and max
 */
export function clamp(min: number, value: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
