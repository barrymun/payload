import { State } from "@state";
import { defaultSpeed, mapHeight, mapWidth, playerHeight, playerWidth, tileHeight, tileWidth } from "@utils/consts";
import { TileType } from "@utils/enums";
import { clamp, range } from "@utils/helpers/math-utils";
import { delay } from "@utils/helpers/time-utils";
import { Direction } from "@utils/types";

export class Player {
  private _state: State;
  private _currentTile = [1, 1]; // current tile position
  private _dimensions = [playerWidth, playerHeight]; // width and height of the player
  private _position = [tileWidth + playerWidth, tileHeight + playerHeight]; // starting x and y position of the player relative to top left corner
  private _speed = defaultSpeed; // speed of the player
  private _acceleration = 0.1; // TODO: acceleration applied to the player
  private _isMining = false; // is the player mining

  constructor(state: State) {
    this._state = state;
  }

  get state() {
    return this._state;
  }

  set state(value) {
    this._state = value;
  }

  get currentTile() {
    return this._currentTile;
  }

  set currentTile(value) {
    this._currentTile = value;
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
    const [xDim, yDim] = this.dimensions;
    const [xPos, yPos] = this.position;
    const halfWidth = tileWidth / 2 + (tileWidth - xDim) / 2;
    const halfHeight = tileHeight / 2 + (tileHeight - yDim) / 2;
    const tileXPos = Math.floor(xPos - halfWidth / tileWidth);
    const tileYPos = Math.floor(yPos - halfHeight / tileHeight);
    let tileX = Math.floor(xPos / tileWidth);
    let tileY = Math.floor(yPos / tileHeight);
    if (Math.floor(xPos % tileWidth) !== 0 && tileXPos % tileWidth > halfWidth) {
      tileX += 1;
    }
    if (Math.floor(yPos % tileHeight) !== 0 && tileYPos % tileHeight > halfHeight) {
      tileY += 1;
    }
    this.currentTile = [tileX, tileY];
  }

  /**
   * Retrieves the tile given the new position the player wishes to move to, considering the game map boundaries.
   * @param newPos The position the player wishes to move to, represented as an array of two numbers [x, y].
   */
  getTile(newPos: typeof this.position) {
    const [xPos, yPos] = newPos;
    const x = this.currentTile[0] + xPos;
    const y = this.currentTile[1] + yPos;
    if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
      return {
        position: [x, y],
        type: this.state.gameMap[y]?.[x] ?? null,
        screenPosition: [x * tileWidth, y * tileHeight],
      };
    }
    return null;
  }

  /**
   * Determines if a player's new position is within the bounds of a given tile.
   * @param tile The tile to check against. If null, the function will return `false`.
   * @param newPos The position the player wishes to move to, represented as an array of two numbers [x, y].
   * @returns `true` if the player's new position overlaps with the tile's position; otherwise, `false`.
   */
  calcIsInTile(tile: { screenPosition: number[] } | null, newPos: typeof this.position) {
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

  /**
   * Check if the player can move given an array of coordinates,
   * each element og which is represented as an array of two numbers [x, y].
   * Check if the player (for any tile provided) is within that tile, and the tile is of a certain type.
   * If this is the case, then the player cannot move.
   * @param newPos the position the player wishes to move to
   * @param tileCoords coords of the tiles around the player that must be checked
   * @returns `true` if the player can move else `false`
   */
  canMove(newPos: typeof this.position, tileCoords: [number, number][]) {
    let r = true;
    for (const newPosCoords of tileCoords) {
      const tile = this.getTile(newPosCoords);
      const isInTile = this.calcIsInTile(tile, newPos);
      if (isInTile && tile?.type === TileType.Earth) {
        r = false;
        break;
      }
    }
    return r;
  }

  canMoveUp(newPos: typeof this.position) {
    const tileCoords: [number, number][] = [
      [0, -1], // above
      [-1, 0], // left
      [1, 0], // right
      [-1, -1], // left top
      [1, -1], // right top
    ];
    return this.canMove(newPos, tileCoords);
  }

  canMoveDown(newPos: typeof this.position) {
    const tileCoords: [number, number][] = [
      [0, 1], // below
      [-1, 0], // left
      [1, 0], // right
      [-1, 1], // left bottom
      [1, 1], // right bottom
    ];
    return this.canMove(newPos, tileCoords);
  }

  canMoveLeft(newPos: typeof this.position) {
    const tileCoords: [number, number][] = [
      [0, -1], // above
      [0, 1], // below
      [-1, 0], // left
      [-1, -1], // left top
      [-1, 1], // left bottom
    ];
    return this.canMove(newPos, tileCoords);
  }

  canMoveRight(newPos: typeof this.position) {
    const tileCoords: [number, number][] = [
      [0, -1], // above
      [0, 1], // below
      [1, 0], // right
      [1, -1], // right top
      [1, 1], // right bottom
    ];
    return this.canMove(newPos, tileCoords);
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
   * @param direction direction to move the player
   * @param velocity velocity at which the player is moving, given the direction
   */
  move(direction: Direction, velocity: number) {
    this.computeCurrentTile();

    const newPos = this.calculatePosition(direction, velocity);

    if (direction === "up" && !this.canMoveUp(newPos)) {
      return;
    }

    if (direction === "down" && !this.canMoveDown(newPos) && !this.isMining) {
      return;
    }

    if (direction === "left" && !this.canMoveLeft(newPos)) {
      return;
    }

    if (direction === "right" && !this.canMoveRight(newPos)) {
      return;
    }

    this.position = newPos;
  }

  async mine() {
    const tileBelowType = this.state.gameMap[this.currentTile[1] + 1][this.currentTile[0]];
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
      this.move("down", 1);
      await delay(10);
    }

    this.state.gameMap[this.currentTile[1]][this.currentTile[0]] = TileType.Tunnel;

    this.isMining = false;
  }
}
