import "./assets/css/style.css";

import { handleKeyDown, handleKeyUp } from "@utils/helpers/key-bindings";

import { drawGame } from "./helpers";
import { State } from "./state";

let state: State;

function handleResize() {
  const canvas = document.querySelector<HTMLCanvasElement>("#game");
  if (!canvas) {
    return;
  }

  state.viewport.screen = [canvas.width, canvas.height];
}

function handleLoad() {
  const ctx = document.querySelector<HTMLCanvasElement>("#game")?.getContext("2d");
  if (!ctx) {
    return;
  }
  ctx.font = "20px monospace";
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
