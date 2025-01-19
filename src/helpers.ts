import { gameMap, mapHeight, mapWidth, tileHeight, tileWidth } from "./consts";
import { State } from "./state";

export function drawGame(state: State) {
  let sec = Math.floor(Date.now() / 1000);
  if (sec !== state.currentSecond) {
    state.currentSecond = sec;
    state.framesLastSecond = state.frameCount;
    state.frameCount = 1;
  } else {
    state.frameCount++;
  }

  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      switch (gameMap[y][x]) {
        case 0:
          state.ctx.fillStyle = '#685b48';
          break;
        default:
          state.ctx.fillStyle = '#5aa457';
      }
      state.ctx.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
    }
  }

  state.ctx.fillStyle = '#ff0000';
  state.ctx.fillText(`FPS: ${state.framesLastSecond}`, 10, 20);

  return requestAnimationFrame(() => drawGame(state));
};
