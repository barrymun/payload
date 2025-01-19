import { State } from "./state";
import { gameMap, mapHeight, mapWidth, tileHeight, tileWidth } from "./utils/consts";

export function drawGame(state: State) {
  const currentFrameTime = Date.now();
  // let timeElapsed = currentFrameTime - state.lastFrameTime; // time elapsed since last frame in ms

  // frame rate calculation
  const sec = Math.floor(Date.now() / 1000);
  if (sec !== state.currentSecond) {
    state.currentSecond = sec;
    state.framesLastSecond = state.frameCount;
    state.frameCount = 1;
  } else {
    state.frameCount++;
  }

  // check if player is moving
  if (!state.player.processMovement(currentFrameTime)) {
    if (
      state.keysDown.ArrowUp &&
      state.player.tileFrom[1] > 0 &&
      gameMap[state.player.tileFrom[1] - 1][state.player.tileFrom[0]] === 1
    ) {
      state.player.tileTo[1] -= 1;
    } else if (
      state.keysDown.ArrowDown &&
      state.player.tileFrom[1] < mapHeight - 1 &&
      gameMap[state.player.tileFrom[1] + 1][state.player.tileFrom[0]] === 1
    ) {
      state.player.tileTo[1] += 1;
    } else if (
      state.keysDown.ArrowLeft &&
      state.player.tileFrom[0] > 0 &&
      gameMap[state.player.tileFrom[1]][state.player.tileFrom[0] - 1] === 1
    ) {
      state.player.tileTo[0] -= 1;
    } else if (
      state.keysDown.ArrowRight &&
      state.player.tileFrom[0] < mapWidth - 1 &&
      gameMap[state.player.tileFrom[1]][state.player.tileFrom[0] + 1] === 1
    ) {
      state.player.tileTo[0] += 1;
    }

    // check if the tile the player is moving to is different from the current tile
    // this logic prevents the player from moving when they are already moving
    if (state.player.tileFrom[0] !== state.player.tileTo[0] || state.player.tileFrom[1] !== state.player.tileTo[1]) {
      state.player.timeMoved = currentFrameTime;
    }
  }

  // fill out the map
  for (let y = 0; y < mapHeight; y++) {
    for (let x = 0; x < mapWidth; x++) {
      switch (gameMap[y][x]) {
        case 0:
          state.ctx.fillStyle = "#685b48";
          break;
        default:
          state.ctx.fillStyle = "#5aa457";
      }
      state.ctx.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
    }
  }

  // draw the player
  state.ctx.fillStyle = "#ff0000";
  state.ctx.fillRect(
    state.player.position[0],
    state.player.position[1],
    state.player.dimensions[0],
    state.player.dimensions[1]
  );

  // fps display
  state.ctx.fillStyle = "#ff0000";
  state.ctx.fillText(`FPS: ${state.framesLastSecond}`, 10, 20);

  state.lastFrameTime = currentFrameTime;
  requestAnimationFrame(() => drawGame(state));
}
