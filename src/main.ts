import { drawGame } from './helpers';
import { State } from './state';
import './style.css'

let state: State;

const handleLoad = () => {
  const ctx = document.querySelector<HTMLCanvasElement>('#game')?.getContext('2d');
  if (!ctx) {
    return;
  }
  // ctx.font = '20px monospace';
  state = new State({ ctx });
  requestAnimationFrame(() => drawGame(state));
};

window.addEventListener('load', handleLoad);
window.addEventListener('unload', () => {
  window.removeEventListener('load', handleLoad);
});
