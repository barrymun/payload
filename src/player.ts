import { State } from "@state";
import { defaultSpeed, mapHeight, mapWidth, playerHeight, playerWidth, tileHeight, tileWidth } from "@utils/consts";
import { TileType } from "@utils/enums";
import { clamp, range } from "@utils/helpers/math-utils";
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
   * Calculate and set the current tile.
   * Take into consideration the player's dimensions.
   * If the player is more than 50% on the next tile, move the player to the next tile.
   * Check the position (x and y) and ensure it does not divide by the tile width or height exactly,
   * or the player will move to a tile a full tile width/height away.
   */
  computeCurrentTile() {
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

  getTile(state: State, xOffset: number, yOffset: number) {
    const x = this.currentTile[0] + xOffset;
    const y = this.currentTile[1] + yOffset;
    if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
      return {
        position: [x, y],
        type: state.gameMap[y]?.[x] ?? null,
        screenPosition: [x * tileWidth, y * tileHeight],
      };
    }
    return null;
  }

  isInTile(tile: { screenPosition: number[] } | null, newPos: typeof this.position) {
    if (!tile) {
      return false;
    }

    const [posX, posY] = newPos.map(Math.floor);
    const [tilePosX, tilePosY] = tile.screenPosition.map(Math.floor);
    const xPlayerRangeSet = new Set(range(posX, posX + playerWidth));
    const xTileRangeSet = new Set(range(tilePosX, tilePosX + tileWidth));
    const yPlayerRangeSet = new Set(range(posY, posY + playerHeight));
    const yTileRangeSet = new Set(range(tilePosY, tilePosY + tileHeight));
    return (
      new Set([...xPlayerRangeSet].filter((x) => xTileRangeSet.has(x))).size > 0 &&
      new Set([...yPlayerRangeSet].filter((y) => yTileRangeSet.has(y))).size > 0
    );
  }

  canMoveUp(state: State, newPos: typeof this.position) {
    const tileAbove = this.getTile(state, 0, -1);
    const tileLeft = this.getTile(state, -1, 0);
    const tileRight = this.getTile(state, 1, 0);
    const tileTopLeft = this.getTile(state, -1, -1);
    const tileTopRight = this.getTile(state, 1, -1);

    const isInTileAbove = this.isInTile(tileAbove, newPos);
    const isInTileLeft = this.isInTile(tileLeft, newPos);
    const isInTileRight = this.isInTile(tileRight, newPos);
    const isInTileTopLeft = this.isInTile(tileTopLeft, newPos);
    const isInTileTopRight = this.isInTile(tileTopRight, newPos);

    if (
      (isInTileAbove && tileAbove?.type === TileType.Earth) ||
      (isInTileLeft && tileLeft?.type === TileType.Earth) ||
      (isInTileRight && tileRight?.type === TileType.Earth) ||
      (isInTileTopLeft && tileTopLeft?.type === TileType.Earth) ||
      (isInTileTopRight && tileTopRight?.type === TileType.Earth)
    ) {
      return false;
    }
    return true;
  }

  canMoveDown(state: State, newPos: typeof this.position) {
    const tileBelow = this.getTile(state, 0, 1);
    const tileLeft = this.getTile(state, -1, 0);
    const tileRight = this.getTile(state, 1, 0);
    const tileBottomLeft = this.getTile(state, -1, 1);
    const tileBottomRight = this.getTile(state, 1, 1);

    const isInTileBelow = this.isInTile(tileBelow, newPos);
    const isInTileLeft = this.isInTile(tileLeft, newPos);
    const isInTileRight = this.isInTile(tileRight, newPos);
    const isInTileBottomLeft = this.isInTile(tileBottomLeft, newPos);
    const isInTileBottomRight = this.isInTile(tileBottomRight, newPos);

    if (
      (isInTileBelow && tileBelow?.type === TileType.Earth) ||
      (isInTileLeft && tileLeft?.type === TileType.Earth) ||
      (isInTileRight && tileRight?.type === TileType.Earth) ||
      (isInTileBottomLeft && tileBottomLeft?.type === TileType.Earth) ||
      (isInTileBottomRight && tileBottomRight?.type === TileType.Earth)
    ) {
      return false;
    }
    return true;
  }

  canMoveLeft(state: State, newPos: typeof this.position) {
    const tileAbove = this.getTile(state, 0, -1);
    const tileBelow = this.getTile(state, 0, 1);
    const tileLeft = this.getTile(state, -1, 0);
    const tileTopLeft = this.getTile(state, -1, -1);
    const tileBottomLeft = this.getTile(state, -1, 1);

    const isInTileAbove = this.isInTile(tileAbove, newPos);
    const isInTileBelow = this.isInTile(tileBelow, newPos);
    const isInTileLeft = this.isInTile(tileLeft, newPos);
    const isInTileTopLeft = this.isInTile(tileTopLeft, newPos);
    const isInTileBottomLeft = this.isInTile(tileBottomLeft, newPos);

    if (
      (isInTileAbove && tileAbove?.type === TileType.Earth) ||
      (isInTileBelow && tileBelow?.type === TileType.Earth) ||
      (isInTileLeft && tileLeft?.type === TileType.Earth) ||
      (isInTileTopLeft && tileTopLeft?.type === TileType.Earth) ||
      (isInTileBottomLeft && tileBottomLeft?.type === TileType.Earth)
    ) {
      return false;
    }
    return true;
  }

  canMoveRight(state: State, newPos: typeof this.position) {
    const tileAbove = this.getTile(state, 0, -1);
    const tileBelow = this.getTile(state, 0, 1);
    const tileRight = this.getTile(state, 1, 0);
    const tileTopRight = this.getTile(state, 1, -1);
    const tileBottomRight = this.getTile(state, 1, 1);

    const isInTileAbove = this.isInTile(tileAbove, newPos);
    const isInTileBelow = this.isInTile(tileBelow, newPos);
    const isInTileRight = this.isInTile(tileRight, newPos);
    const isInTileTopRight = this.isInTile(tileTopRight, newPos);
    const isInTileBottomRight = this.isInTile(tileBottomRight, newPos);

    if (
      (isInTileAbove && tileAbove?.type === TileType.Earth) ||
      (isInTileBelow && tileBelow?.type === TileType.Earth) ||
      (isInTileRight && tileRight?.type === TileType.Earth) ||
      (isInTileTopRight && tileTopRight?.type === TileType.Earth) ||
      (isInTileBottomRight && tileBottomRight?.type === TileType.Earth)
    ) {
      return false;
    }
    return true;
  }

  calculatePosition(direction: Direction, velocity: number) {
    const calculatedVelocity = velocity;
    const xOffset = tileWidth - this.dimensions[0];
    const yOffset = tileHeight - this.dimensions[1];
    const tempPosition = [...this.position];
    switch (direction) {
      case "up":
        // TODO:
        // if (calculatedVelocity > this.position[1] % tileHeight && this.position[1] % tileHeight > 0) {
        //   calculatedVelocity = this.position[1] % tileHeight;
        // }
        tempPosition[1] -= calculatedVelocity;
        break;
      case "down":
        // TODO:
        // if (calculatedVelocity > tileHeight - (this.position[1] % tileHeight)) {
        //   calculatedVelocity = tileHeight - (this.position[1] % tileHeight);
        // }
        tempPosition[1] += calculatedVelocity;
        break;
      case "left":
        // TODO:
        // if (calculatedVelocity > this.position[0] % tileWidth && this.position[0] % tileWidth > 0) {
        //   calculatedVelocity = this.position[0] % tileWidth;
        // }
        tempPosition[0] -= calculatedVelocity;
        break;
      case "right":
        // TODO:
        // if (calculatedVelocity > tileWidth - (this.position[0] % tileWidth)) {
        //   calculatedVelocity = tileWidth - (this.position[0] % tileWidth);
        // }
        tempPosition[0] += calculatedVelocity;
        break;
      default:
        break;
    }
    return [
      clamp(0, tempPosition[0], tileWidth * (mapWidth - 1) + xOffset),
      clamp(0, tempPosition[1], tileHeight * (mapHeight - 1) + yOffset),
    ].map(Math.floor);
  }

  /**
   * @param state game state
   * @param direction direction to move the player
   * @param velocity velocity at which the player is moving, given the direction
   */
  move(state: State, direction: Direction, velocity: number) {
    this.computeCurrentTile();

    const newPos = this.calculatePosition(direction, velocity);

    if (direction === "up" && !this.canMoveUp(state, newPos)) {
      return;
    }

    if (direction === "down" && !this.canMoveDown(state, newPos) && !this.isMining) {
      return;
    }

    if (direction === "left" && !this.canMoveLeft(state, newPos)) {
      return;
    }

    if (direction === "right" && !this.canMoveRight(state, newPos)) {
      return;
    }

    this.position = newPos;
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
