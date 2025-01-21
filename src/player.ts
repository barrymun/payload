import { State } from "@state";
import { defaultSpeed, mapHeight, mapWidth, playerHeight, playerWidth, tileHeight, tileWidth } from "@utils/consts";
import { TileType } from "@utils/enums";
import { clamp } from "@utils/helpers/math-utils";
import { delay } from "@utils/helpers/time-utils";
import { Direction } from "@utils/types";

export class Player {
  // private _currentTile = [1, 1]; // current tile position
  private _currentTile = [0, 0]; // current tile position
  private _timeMoved = 0; // time at which movement began to the next tile
  private _dimensions = [playerWidth, playerHeight]; // width and height of the player
  // private _position = [tileWidth + playerWidth, tileHeight + playerHeight]; // starting x and y position of the player relative to top left corner
  private _position = [0, 0]; // starting x and y position of the player relative to top left corner
  private _delayMove = 700; // time it takes to move from one tile to another in ms
  private _speed = defaultSpeed; // speed of the player
  private _acceleration = 0.1; // acceleration applied to the player
  private _isMining = false; // is the player mining

  get currentTile() {
    return this._currentTile;
  }

  set currentTile(value) {
    this._currentTile = value;
  }

  get timeMoved() {
    return this._timeMoved;
  }

  set timeMoved(value) {
    this._timeMoved = value;
  }

  get dimensions() {
    return this._dimensions;
  }

  set dimensions(value) {
    this._dimensions = value;
  }

  get position() {
    return this._position;
  }

  set position(value) {
    this._position = value;
  }

  get delayMove() {
    return this._delayMove;
  }

  set delayMove(value) {
    this._delayMove = value;
  }

  get speed() {
    return this._speed;
  }

  set speed(value) {
    this._speed = value;
  }

  get acceleration() {
    return this._acceleration;
  }

  set acceleration(value) {
    this._acceleration = value;
  }

  get isMining() {
    return this._isMining;
  }

  set isMining(value) {
    this._isMining = value;
  }

  /**
   * calculate new tile position
   * take into consideration the player's dimensions
   * if the player is more than 50% on the next tile, move the player to the next tile
   * also check the position (x and y) and ensure it does not divide by the tile width or height exactly,
   * or the player will move to a tile a full tile width/height away
   * @param state game state
   * @param direction direction to move the player
   * @param velocity velocity at which the player is moving, given the direction
   */
  move(state: State, direction: Direction, velocity: number) {
    const tileAbove = state.gameMap[this.currentTile[1] - 1]?.[this.currentTile[0]] ?? null;
    const tileBelow = state.gameMap[this.currentTile[1] + 1]?.[this.currentTile[0]] ?? null;
    const tileLeft = state.gameMap[this.currentTile[1]]?.[this.currentTile[0] - 1] ?? null;
    const tileRight = state.gameMap[this.currentTile[1]]?.[this.currentTile[0] + 1] ?? null;

    const hasSpaceVertically = Math.floor(this.position[1] % tileHeight) !== 0;
    const hasSpaceHorizontally = Math.floor(this.position[0] % tileWidth) !== 0;
    const hasSpaceRight = this.position[0] < this.currentTile[0] * tileWidth;
    const hasSpaceLeft = this.position[0] > this.currentTile[0] * tileWidth;

    const canMoveUp = tileAbove === TileType.Sky || tileAbove === TileType.Tunnel || hasSpaceVertically;
    if (direction === "up" && !canMoveUp) {
      return;
    }

    const canMoveDown =
      this.isMining || tileBelow === TileType.Sky || tileBelow === TileType.Tunnel || hasSpaceVertically;
    if (direction === "down" && !canMoveDown) {
      return;
    }

    const canMoveLeft =
      tileLeft === TileType.Sky || tileLeft === TileType.Tunnel || (hasSpaceHorizontally && hasSpaceLeft);
    if (direction === "left" && !canMoveLeft) {
      return;
    }

    const canMoveRight =
      tileRight === TileType.Sky || tileRight === TileType.Tunnel || (hasSpaceHorizontally && hasSpaceRight);
    if (direction === "right" && !canMoveRight) {
      return;
    }

    let actualVelocity = velocity;
    let offsetVelocity = 0; // this handles cases where velocity > remaining distance to the next tile
    const xOffset = tileWidth - this.dimensions[0];
    const yOffset = tileHeight - this.dimensions[1];
    const tempPosition = [...this.position];
    switch (direction) {
      case "up":
        if (canMoveUp) {
          offsetVelocity = tileHeight - (tempPosition[1] % tileHeight);
          actualVelocity = Math.min(velocity, offsetVelocity);
        }
        tempPosition[1] -= actualVelocity;
        break;
      case "down":
        if (canMoveDown) {
          offsetVelocity = tileHeight - (tempPosition[1] % tileHeight);
          actualVelocity = Math.min(velocity, offsetVelocity);
        }
        tempPosition[1] += actualVelocity;
        break;
      case "left":
        tempPosition[0] -= actualVelocity;
        break;
      case "right":
        tempPosition[0] += actualVelocity;
        break;
      default:
        break;
    }
    const newPosition = [
      clamp(0, tempPosition[0], tileWidth * (mapWidth - 1) + xOffset),
      clamp(0, tempPosition[1], tileHeight * (mapHeight - 1) + yOffset),
    ];
    this.position = newPosition;

    const halfWidth = this.dimensions[0] / 2;
    const halfHeight = this.dimensions[1] / 2;
    const tileXPos = this.position[0] - halfWidth / tileWidth;
    const tileYPos = this.position[1] - halfHeight / tileHeight;
    let tileX = Math.floor(this.position[0] / tileWidth);
    let tileY = Math.floor(this.position[1] / tileHeight);
    if (this.position[0] % tileWidth !== 0 && tileXPos % tileWidth > halfWidth) {
      tileX += 1;
    }
    if (this.position[1] % tileHeight !== 0 && tileYPos % tileHeight > halfHeight) {
      tileY += 1;
    }
    this.currentTile = [tileX, tileY];
  }

  async mine(state: State) {
    const tileBelowType = state.gameMap[this.currentTile[1] + 1][this.currentTile[0]];
    if (
      this.isMining ||
      this.currentTile[1] === mapHeight - 1 ||
      tileBelowType === TileType.Sky ||
      tileBelowType === TileType.Tunnel
    ) {
      return;
    }
    this.isMining = true;

    for (let t = 0; t < tileHeight; t++) {
      this.move(state, "down", 1);
      await delay(10);
    }

    // set the new tile type
    state.gameMap[this.currentTile[1]][this.currentTile[0]] = TileType.Tunnel;

    this.isMining = false;
  }
}
