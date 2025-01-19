import { drawGame } from './helpers';
import { State } from './state';
import './style.css'

let state: State;

function handleKeyDown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowLeft':
      state.keysDown.ArrowLeft = true;
      break;
    case 'ArrowRight':
      state.keysDown.ArrowRight = true;
      break;
    case 'ArrowUp':
      state.keysDown.ArrowUp = true;
      break;
    case 'ArrowDown':
      state.keysDown.ArrowDown = true;
      break;
    default:
      state.keysDown = {
        ArrowLeft: true,
        ArrowUp: true,
        ArrowRight: true,
        ArrowDown: true,
      }
      break;
  }
}

function handleKeyUp(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowLeft':
      state.keysDown.ArrowLeft = false;
      break;
    case 'ArrowRight':
      state.keysDown.ArrowRight = false;
      break;
    case 'ArrowUp':
      state.keysDown.ArrowUp = false;
      break;
    case 'ArrowDown':
      state.keysDown.ArrowDown = false;
      break;
    default:
      state.keysDown = {
        ArrowLeft: false,
        ArrowUp: false,
        ArrowRight: false,
        ArrowDown: false,
      }
      break;
  }
}

function handleLoad() {
  const ctx = document.querySelector<HTMLCanvasElement>('#game')?.getContext('2d');
  if (!ctx) {
    return;
  }
  ctx.font = '20px monospace';
  state = new State(ctx);
  requestAnimationFrame(() => drawGame(state));

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
};

window.addEventListener('load', handleLoad);
window.addEventListener('unload', () => {
  window.removeEventListener('load', handleLoad);
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});
