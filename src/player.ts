import { State } from "@state";
import { defaultSpeed, mapHeight, mapWidth, playerHeight, playerWidth, tileHeight, tileWidth } from "@utils/consts";
import { TileType } from "@utils/enums";
import { clamp, range } from "@utils/helpers/math-utils";
import { delay } from "@utils/helpers/time-utils";
import { Direction, MiningDirection } from "@utils/types";

export class Player {
  private _state: State;
  private _currentTile = [1, 1]; // current tile position
  private _dimensions = [playerWidth, playerHeight]; // width and height of the player
  private _position = [tileWidth + playerWidth, tileHeight + playerHeight]; // starting x and y position of the player relative to top left corner
  private _speed = defaultSpeed; // speed of the player
  private _acceleration = 0.1; // TODO: acceleration applied to the player
  private _isMining = false; // is the player mining
  private _miningDelay = 20; // delay in ms when mining when drilling through each pixel
  private _miningBlocked = false; // block the mining ability
  private _miningBlockedTimeout = 400; // ms
  private _miningTimeoutId: number | null = null;

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

  private get miningDelay() {
    return this._miningDelay;
  }

  private set miningDelay(value) {
    this._miningDelay = value;
  }

  private get miningBlocked() {
    return this._miningBlocked;
  }

  private set miningBlocked(value) {
    this._miningBlocked = value;
  }

  private get miningBlockedTimeout() {
    return this._miningBlockedTimeout;
  }

  private set miningBlockedTimeout(value) {
    this._miningBlockedTimeout = value;
  }

  private get miningTimeoutId() {
    return this._miningTimeoutId;
  }

  private set miningTimeoutId(value) {
    this._miningTimeoutId = value;
  }

  releaseMiningBlock() {
    setTimeout(() => {
      this.miningBlocked = false;
    }, this.miningBlockedTimeout);
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
   * Calculate the ranges for the "is within tile" and "is fully within tile" methods.
   * @param tile The tile to check against.
   * @param newPos The position the player wishes to move to, represented as an array of two numbers [x, y].
   * @returns The relevant ranges to check.
   */
  calcIsInTileRanges(tile: { screenPosition: number[] }, newPos: typeof this.position) {
    const [posX, posY] = newPos.map(Math.floor);
    const [tilePosX, tilePosY] = tile.screenPosition.map(Math.floor);
    const xPlayerRangeSet = new Set(range(posX, posX + playerWidth));
    const xTileRangeSet = new Set(range(tilePosX, tilePosX + tileWidth));
    const yPlayerRangeSet = new Set(range(posY, posY + playerHeight));
    const yTileRangeSet = new Set(range(tilePosY, tilePosY + tileHeight));
    return {
      xPlayerRangeSet,
      xTileRangeSet,
      yPlayerRangeSet,
      yTileRangeSet,
    };
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

    const { xPlayerRangeSet, xTileRangeSet, yPlayerRangeSet, yTileRangeSet } = this.calcIsInTileRanges(tile, newPos);
    return (
      new Set([...xPlayerRangeSet].filter((x) => xTileRangeSet.has(x))).size > 0 &&
      new Set([...yPlayerRangeSet].filter((y) => yTileRangeSet.has(y))).size > 0
    );
  }

  /**
   * Determines if a player's new position is fully contained within the given tile.
   * @param tile The tile to check against. If null, the function will return `false`.
   * @param newPos The position the player wishes to move to, represented as an array of two numbers [x, y].
   * @returns `true` if the player's new position is fully contained within the tile's position; otherwise, `false`.
   */
  calcIsFullyInTile(tile: { screenPosition: number[] } | null, newPos: typeof this.position): boolean {
    if (!tile) {
      return false;
    }

    const { xPlayerRangeSet, xTileRangeSet, yPlayerRangeSet, yTileRangeSet } = this.calcIsInTileRanges(tile, newPos);
    return (
      [...xPlayerRangeSet].every((value) => xTileRangeSet.has(value)) &&
      [...yPlayerRangeSet].every((value) => yTileRangeSet.has(value))
    );
  }

  /**
   * Check if the player can move given an array of coordinates,
   * each element of which is represented as an array of two numbers [x, y].
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
    return this.canMove(newPos, tileCoords) && !this.isMining;
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
    const xOffset = tileWidth - this.dimensions[0];
    const yOffset = tileHeight - this.dimensions[1];
    const tempPosition = [...this.position];

    switch (direction) {
      case "up":
        tempPosition[1] -= velocity;
        break;
      case "down":
        tempPosition[1] += velocity;
        break;
      case "left":
        tempPosition[0] -= velocity;
        break;
      case "right":
        tempPosition[0] += velocity;
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
   * Check if the player is touching the ground, assuming they cannot move further down.
   */
  isAtGroundLevel(): boolean {
    return this.position[1] + tileHeight - (tileHeight - playerHeight) === (this.currentTile[1] + 1) * tileHeight;
  }

  isTouchingRightTile(): boolean {
    return this.position[0] + tileWidth - (tileWidth - playerWidth) === (this.currentTile[0] + 1) * tileWidth;
  }

  isTouchingLeftTile(): boolean {
    return this.position[0] === this.currentTile[0] * tileWidth;
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
      if (!this.isAtGroundLevel()) {
        // If not at ground level, then set the player's y position to be ground level.
        this.position[1] = this.currentTile[1] * tileHeight;
      }
      return;
    }

    if (direction === "left" && !this.canMoveLeft(newPos) && !this.isMining) {
      if (!this.isTouchingLeftTile()) {
        this.position[0] = this.currentTile[0] * tileWidth;
      }
      return;
    }

    if (direction === "right" && !this.canMoveRight(newPos) && !this.isMining) {
      if (!this.isTouchingRightTile()) {
        this.position[0] = this.currentTile[0] * tileWidth + (tileWidth - playerWidth);
      }
      return;
    }

    // Checks cleared, set the player's new position.
    this.position = newPos;

    // Block the player from mining for a short period after movement.
    this.miningBlocked = true;

    // Release the block after a short delay.
    if (this.miningTimeoutId) {
      clearTimeout(this.miningTimeoutId);
    }
    this.miningTimeoutId = setTimeout(() => {
      this.releaseMiningBlock();
    }, 100);
  }

  canMine(direction: MiningDirection): boolean {
    if (this.miningBlocked) {
      return false;
    }

    // check if the player is within the bounds of the current tile
    const tile = this.getTile([0, 0]);
    const isInTile = this.calcIsFullyInTile(tile, this.position);
    const tileBelow = this.state.gameMap[this.currentTile[1] + 1][this.currentTile[0]];
    const tileLeft = this.state.gameMap[this.currentTile[1]][this.currentTile[0] - 1];
    const tileRight = this.state.gameMap[this.currentTile[1]][this.currentTile[0] + 1];

    // check that the player is touching the ground and that the tileBelow is solid (cannot mine in mid air)
    if (!this.isAtGroundLevel() || tileBelow !== TileType.Earth) {
      return false;
    }

    // check that the player is against the edge of the tile to be mined
    if (direction === "left" && !this.isTouchingLeftTile()) {
      return false;
    }
    if (direction === "right" && !this.isTouchingRightTile()) {
      return false;
    }

    // check the type of the tile to be mined
    let tileToBeMinedType: number | null = null;
    switch (direction) {
      case "down":
        tileToBeMinedType = tileBelow;
        break;
      case "left":
        tileToBeMinedType = tileLeft;
        break;
      case "right":
        tileToBeMinedType = tileRight;
        break;
      default:
        break;
    }

    if (tileToBeMinedType === null) {
      return false;
    }

    if (
      !isInTile ||
      this.isMining ||
      (direction === "down" && this.currentTile[1] === mapHeight - 1) ||
      (direction === "left" && this.currentTile[0] === 0) ||
      (direction === "right" && this.currentTile[0] === mapWidth - 1) ||
      tileToBeMinedType === TileType.Sky ||
      tileToBeMinedType === TileType.Tunnel
    ) {
      return false;
    }

    return true;
  }

  async mine(direction: MiningDirection) {
    if (!this.canMine(direction)) {
      return;
    }

    this.isMining = true;
    this.miningBlocked = true;

    const bounds = direction === "down" ? tileHeight : tileWidth;

    // TODO: move the player towards the center of the tile while mining (if they are near the edges)?
    for (let t = 0; t < bounds; t++) {
      this.move(direction, 1);
      await delay(this.miningDelay);
    }

    this.state.gameMap[this.currentTile[1]][this.currentTile[0]] = TileType.Tunnel;

    this.isMining = false;
    this.releaseMiningBlock();
  }
}
