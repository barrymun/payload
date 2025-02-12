import { Player } from "@player";
import { State } from "@state";
import { tileHeight, tileWidth } from "@utils/consts";
import { TileType } from "@utils/enums";
import { resizeCanvas } from "@utils/helpers/draw";
import { Viewport } from "@viewport";

export class Engine {
  private _state: State;
  private _viewport: Viewport;
  private _player: Player;

  constructor(state: State) {
    this._state = state;
    this._viewport = new Viewport(state);
    this._player = new Player(state);
  }

  get state() {
    return this._state;
  }

  set state(value) {
    this._state = value;
  }

  get viewport() {
    return this._viewport;
  }

  // set viewport(value) {
  //   this._viewport = value;
  // }

  get player() {
    return this._player;
  }

  // set player(value) {
  //   this._player = value;
  // }

  run = () => {
    const currentFrameTime = Date.now();

    // frame rate calculation
    const sec = Math.floor(Date.now() / 1000);
    if (sec !== this.state.currentSecond) {
      this.state.currentSecond = sec;
      this.state.framesLastSecond = this.state.frameCount;
      this.state.frameCount = 1;
    } else {
      this.state.frameCount++;
    }

    const gravity = 5; //temp
    const speed = 2.36; // temp

    if (!this.player.isMining) {
      // handle gravity
      if (!this.state.keysDown.ArrowUp) {
        this.player.move("down", gravity);
      }
      // manual gravity
      // if (state.keysDown.ArrowDown) {
      //   this.player.move(state, "down", speed);
      // }

      // check horizontal movement
      if (this.state.keysDown.ArrowLeft && !this.state.keysDown.ArrowRight) {
        if (this.player.canMine("left")) {
          this.player.mine("left");
        } else {
          this.player.move("left", speed);
        }
      } else if (this.state.keysDown.ArrowRight && !this.state.keysDown.ArrowLeft) {
        if (this.player.canMine("right")) {
          this.player.mine("right");
        } else {
          this.player.move("right", speed);
        }
      }

      // check if the player wants to fly (arrow up pressed)
      if (this.state.keysDown.ArrowUp) {
        this.player.move("up", speed);
      }

      // TODO: re-implement
      // check if the player wants to start mining
      if (this.state.keysDown.ArrowDown) {
        this.player.mine("down");
      }
    }

    // update the viewport camera
    this.viewport.update(
      this.player.position[0] + this.player.dimensions[0] / 2,
      this.player.position[1] + this.player.dimensions[1] / 2
    );
    this.state.ctx.fillStyle = "#000000"; // clear the canvas and set to black
    this.state.ctx.fillRect(0, 0, this.viewport.screen[0], this.viewport.screen[1]); // clear the canvas

    // fill out the map
    // only draw the tiles that are visible on the screen
    for (let y = this.viewport.startTile[1]; y <= this.viewport.endTile[1]; y++) {
      for (let x = this.viewport.startTile[0]; x <= this.viewport.endTile[0]; x++) {
        switch (this.state.gameMap[y][x]) {
          case TileType.Sky:
            this.state.ctx.fillStyle = "#86c5da";
            break;
          case TileType.Tunnel:
            this.state.ctx.fillStyle = "#c6893d";
            break;
          case TileType.Earth:
            this.state.ctx.fillStyle = "#964b00";
            break;
          default:
            this.state.ctx.fillStyle = "#5aa457";
        }

        // TODO: add "isDebugging" field to Engine class
        // debug the player's current tile
        if (this.player.currentTile[0] === x && this.player.currentTile[1] === y) {
          this.state.ctx.fillStyle = "#32CD32";
        }

        this.state.ctx.fillRect(
          this.viewport.offset[0] + x * tileWidth,
          this.viewport.offset[1] + y * tileHeight,
          tileWidth,
          tileHeight
        );
      }
    }

    // draw the player, ensuring to adjust for the viewport offset
    this.state.ctx.fillStyle = "#ff0000";
    this.state.ctx.fillRect(
      this.viewport.offset[0] + this.player.position[0],
      this.viewport.offset[1] + this.player.position[1],
      this.player.dimensions[0],
      this.player.dimensions[1]
    );

    // fps display
    this.state.ctx.fillStyle = "#ff0000";
    this.state.ctx.fillText(`FPS: ${this.state.framesLastSecond}`, 10, 20);

    this.state.lastFrameTime = currentFrameTime;
    requestAnimationFrame(this.run);
  };

  handleResize = () => {
    const canvas = document.querySelector<HTMLCanvasElement>("#game");
    if (!canvas) {
      return;
    }

    resizeCanvas(canvas);
    this.viewport.screen = [canvas.width, canvas.height];
  };

  handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowLeft":
        this.state.keysDown.ArrowLeft = true;
        break;
      case "ArrowRight":
        this.state.keysDown.ArrowRight = true;
        break;
      case "ArrowUp":
        this.state.keysDown.ArrowUp = true;
        break;
      case "ArrowDown":
        this.state.keysDown.ArrowDown = true;
        break;
      default:
        break;
    }
  };

  handleKeyUp = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowLeft":
        this.state.keysDown.ArrowLeft = false;
        break;
      case "ArrowRight":
        this.state.keysDown.ArrowRight = false;
        break;
      case "ArrowUp":
        this.state.keysDown.ArrowUp = false;
        break;
      case "ArrowDown":
        this.state.keysDown.ArrowDown = false;
        break;
      default:
        break;
    }
  };

  stop = () => {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
    window.removeEventListener("resize", this.handleResize);
  };

  start = () => {
    requestAnimationFrame(this.run);

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("unload", this.stop);

    this.handleResize();
  };
}
