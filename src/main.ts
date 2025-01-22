import "@assets/css/style.css";

import { Engine } from "@engine";
import { State } from "@state";

let state: State;
let engine: Engine;

function handleLoad() {
  const ctx = document.querySelector<HTMLCanvasElement>("#game")?.getContext("2d");
  if (!ctx) {
    return;
  }

  state = new State(ctx);
  engine = new Engine(state);
  engine.start();
}

window.addEventListener("load", handleLoad);
