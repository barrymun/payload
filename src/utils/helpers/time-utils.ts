/**
 * Delay for a given time
 * @param t time in ms
 * @returns a promise that resolves after the given time
 */
export function delay(t: number) {
  return new Promise((resolve) => setTimeout(resolve, t));
}
