import { vi } from "vitest";

// silence "Error: Not implemented: HTMLCanvasElement.prototype.getContext" error
vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => {
  return {
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    fillText: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
});
