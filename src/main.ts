import "@assets/css/style.css";

import { State } from "@state";
import { drawGame, resizeCanvas } from "@utils/helpers/draw";
import { handleKeyDown, handleKeyUp } from "@utils/helpers/key-bindings";

let state: State;

function handleResize() {
  const canvas = document.querySelector<HTMLCanvasElement>("#game");
  if (!canvas) {
    return;
  }

  resizeCanvas(canvas);
  state.viewport.screen = [canvas.width, canvas.height];
}

function handleLoad() {
  const ctx = document.querySelector<HTMLCanvasElement>("#game")?.getContext("2d");
  if (!ctx) {
    return;
  }
  state = new State(ctx);
  requestAnimationFrame(() => drawGame(state));

  window.addEventListener("keydown", handleKeyDown(state));
  window.addEventListener("keyup", handleKeyUp(state));

  handleResize();
  window.addEventListener("resize", handleResize);
}

window.addEventListener("load", handleLoad);
window.addEventListener("unload", () => {
  window.removeEventListener("load", handleLoad);
  window.removeEventListener("keydown", handleKeyDown(state));
  window.removeEventListener("keyup", handleKeyUp(state));
  window.removeEventListener("resize", handleResize);
});
