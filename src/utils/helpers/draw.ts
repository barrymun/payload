import { State } from "@state";
import { gameMap, mapHeight, mapWidth, tileHeight, tileWidth } from "@utils/consts";

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

  // update the viewport camera
  state.viewport.update(
    state.player.position[0] + state.player.dimensions[0] / 2,
    state.player.position[1] + state.player.dimensions[1] / 2
  );
  state.ctx.fillStyle = "#000000"; // clear the canvas and set to black
  state.ctx.fillRect(0, 0, state.viewport.screen[0], state.viewport.screen[1]); // clear the canvas

  // fill out the map
  // only draw the tiles that are visible on the screen
  for (let y = state.viewport.startTile[1]; y <= state.viewport.endTile[1]; y++) {
    for (let x = state.viewport.startTile[0]; x <= state.viewport.endTile[0]; x++) {
      switch (gameMap[y][x]) {
        case 0:
          state.ctx.fillStyle = "#685b48";
          break;
        default:
          state.ctx.fillStyle = "#5aa457";
      }
      state.ctx.fillRect(
        state.viewport.offset[0] + x * tileWidth,
        state.viewport.offset[1] + y * tileHeight,
        tileWidth,
        tileHeight
      );
    }
  }

  // draw the player, ensuring to adjust for the viewport offset
  state.ctx.fillStyle = "#ff0000";
  state.ctx.fillRect(
    state.viewport.offset[0] + state.player.position[0],
    state.viewport.offset[1] + state.player.position[1],
    state.player.dimensions[0],
    state.player.dimensions[1]
  );

  // fps display
  state.ctx.fillStyle = "#ff0000";
  state.ctx.fillText(`FPS: ${state.framesLastSecond}`, 10, 20);

  state.lastFrameTime = currentFrameTime;
  requestAnimationFrame(() => drawGame(state));
}

export function resizeCanvas(canvas: HTMLCanvasElement) {
  const { clientWidth, clientHeight } = document.documentElement;
  canvas.width = clientWidth;
  canvas.height = clientHeight;

  const ctx = canvas.getContext("2d")!;
  ctx.resetTransform();
  ctx.scale(1, 1);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "20px monospace";

  return ctx;
}
