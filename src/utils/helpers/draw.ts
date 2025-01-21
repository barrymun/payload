import { State } from "@state";
import { tileHeight, tileWidth } from "@utils/consts";
import { TileType } from "@utils/enums";

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

  const gravity = 5; //temp
  const speed = 2; // temp

  if (!state.player.isMining) {
    // handle gravity
    if (!state.keysDown.ArrowUp) {
      state.player.move(state, "down", gravity);
    }

    // check horizontal movement
    if (state.keysDown.ArrowLeft && !state.keysDown.ArrowRight) {
      state.player.move(state, "left", speed);
    } else if (state.keysDown.ArrowRight && !state.keysDown.ArrowLeft) {
      state.player.move(state, "right", speed);
    }

    // check if the player wants to fly (arrow up pressed)
    if (state.keysDown.ArrowUp) {
      state.player.move(state, "up", speed);
    }

    // check if the player wants to start mining
    if (state.keysDown.ArrowDown) {
      state.player.mine(state);
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
      switch (state.gameMap[y][x]) {
        case TileType.Sky:
          state.ctx.fillStyle = "#86c5da";
          break;
        case TileType.Tunnel:
          state.ctx.fillStyle = "#c6893d";
          break;
        case TileType.Earth:
          state.ctx.fillStyle = "#964b00";
          break;
        default:
          state.ctx.fillStyle = "#5aa457";
      }

      // debug the player's current tile
      if (state.player.currentTile[0] === x && state.player.currentTile[1] === y) {
        state.ctx.fillStyle = "#32CD32";
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

export function getWindowDimensions() {
  const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  const height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  return { width, height };
}

export function resizeCanvas(canvas: HTMLCanvasElement) {
  const { width, height } = getWindowDimensions();
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d")!;
  ctx.resetTransform();
  ctx.scale(1, 1);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "20px monospace";

  return ctx;
}
