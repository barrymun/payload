import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import { Engine } from "@engine";
import { State } from "@state";

describe(Engine.name, () => {
  describe("Keyboard handlers", () => {
    let canvas: HTMLCanvasElement;
    let mockContext: CanvasRenderingContext2D;
    let state: State;
    let engine: Engine;

    beforeEach(() => {
      // Create a mock canvas element
      canvas = document.createElement("canvas");
      canvas.id = "game";
      state = new State(canvas.getContext("2d")!);
      engine = new Engine(state);

      // Mock 2D context
      mockContext = {
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
        // Add any other methods you might use
      } as unknown as CanvasRenderingContext2D;

      // Mock getContext to return the mockContext
      vi.spyOn(canvas, "getContext").mockImplementation((contextType) => {
        if (contextType === "2d") {
          return mockContext;
        }
        return null;
      });

      // Append the canvas to the document body
      document.body.appendChild(canvas);
    });

    afterEach(() => {
      // Clean up by removing the canvas from the document body
      document.body.removeChild(canvas);
    });

    it("should retrieve the 2D context from the canvas", () => {
      const ctx = document.querySelector<HTMLCanvasElement>("#game")?.getContext("2d");
      expect(ctx).toBe(mockContext); // Ensure the mocked context is returned
    });

    it("should call fillRect on the 2D context", () => {
      const ctx = document.querySelector<HTMLCanvasElement>("#game")?.getContext("2d");
      expect(ctx).toBe(mockContext);

      ctx?.fillRect(10, 10, 100, 100);
      expect(mockContext.fillRect).toHaveBeenCalledWith(10, 10, 100, 100);
    });

    it("should set ArrowLeft to true on keydown", () => {
      const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
      engine.handleKeyDown(event);
      expect(state.keysDown.ArrowLeft).toBe(true);
    });

    it("should set ArrowRight to true on keydown", () => {
      const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
      engine.handleKeyDown(event);
      expect(state.keysDown.ArrowRight).toBe(true);
    });

    it("should set ArrowUp to true on keydown", () => {
      const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
      engine.handleKeyDown(event);
      expect(state.keysDown.ArrowUp).toBe(true);
    });

    it("should set ArrowDown to true on keydown", () => {
      const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
      engine.handleKeyDown(event);
      expect(state.keysDown.ArrowDown).toBe(true);
    });

    it("should set ArrowLeft to false on keyup", () => {
      const keyDownEvent = new KeyboardEvent("keydown", { key: "ArrowLeft" });
      const keyUpEvent = new KeyboardEvent("keyup", { key: "ArrowLeft" });

      engine.handleKeyDown(keyDownEvent);
      expect(state.keysDown.ArrowLeft).toBe(true);

      engine.handleKeyUp(keyUpEvent);
      expect(state.keysDown.ArrowLeft).toBe(false);
    });

    it("should set ArrowRight to false on keyup", () => {
      const keyDownEvent = new KeyboardEvent("keydown", { key: "ArrowRight" });
      const keyUpEvent = new KeyboardEvent("keyup", { key: "ArrowRight" });

      engine.handleKeyDown(keyDownEvent);
      expect(state.keysDown.ArrowRight).toBe(true);

      engine.handleKeyUp(keyUpEvent);
      expect(state.keysDown.ArrowRight).toBe(false);
    });

    it("should set ArrowUp to false on keyup", () => {
      const keyDownEvent = new KeyboardEvent("keydown", { key: "ArrowUp" });
      const keyUpEvent = new KeyboardEvent("keyup", { key: "ArrowUp" });

      engine.handleKeyDown(keyDownEvent);
      expect(state.keysDown.ArrowUp).toBe(true);

      engine.handleKeyUp(keyUpEvent);
      expect(state.keysDown.ArrowUp).toBe(false);
    });

    it("should set ArrowDown to false on keyup", () => {
      const keyDownEvent = new KeyboardEvent("keydown", { key: "ArrowDown" });
      const keyUpEvent = new KeyboardEvent("keyup", { key: "ArrowDown" });

      engine.handleKeyDown(keyDownEvent);
      expect(state.keysDown.ArrowDown).toBe(true);

      engine.handleKeyUp(keyUpEvent);
      expect(state.keysDown.ArrowDown).toBe(false);
    });

    it("should not modify state for unrelated keys", () => {
      const event = new KeyboardEvent("keydown", { key: "a" });
      engine.handleKeyDown(event);

      expect(state.keysDown.ArrowLeft).toBe(false);
      expect(state.keysDown.ArrowRight).toBe(false);
      expect(state.keysDown.ArrowUp).toBe(false);
      expect(state.keysDown.ArrowDown).toBe(false);
    });

    it("should not modify state for unrelated keys", () => {
      const event = new KeyboardEvent("keyup", { key: "a" });
      engine.handleKeyUp(event);

      expect(state.keysDown.ArrowLeft).toBe(false);
      expect(state.keysDown.ArrowRight).toBe(false);
      expect(state.keysDown.ArrowUp).toBe(false);
      expect(state.keysDown.ArrowDown).toBe(false);
    });
  });
});
