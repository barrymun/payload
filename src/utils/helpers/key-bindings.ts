import { State } from "@state";

export const handleKeyDown = (state: State) => (e: KeyboardEvent) => {
  switch (e.key) {
    case "ArrowLeft":
      state.keysDown.ArrowLeft = true;
      break;
    case "ArrowRight":
      state.keysDown.ArrowRight = true;
      break;
    case "ArrowUp":
      state.keysDown.ArrowUp = true;
      break;
    case "ArrowDown":
      state.keysDown.ArrowDown = true;
      break;
    default:
      break;
  }
};

export const handleKeyUp = (state: State) => (e: KeyboardEvent) => {
  switch (e.key) {
    case "ArrowLeft":
      state.keysDown.ArrowLeft = false;
      break;
    case "ArrowRight":
      state.keysDown.ArrowRight = false;
      break;
    case "ArrowUp":
      state.keysDown.ArrowUp = false;
      break;
    case "ArrowDown":
      state.keysDown.ArrowDown = false;
      break;
    default:
      break;
  }
};
