import { playerHeight, playerWidth, tileWidth } from "./utils/consts";

export class Player {
  private _tileFrom = [1, 1]; // current tile position
  private _tileTo = [1, 1]; // next tile position
  private _timeMoved = 0; // time at which movement began to the next tile
  private _dimensions = [playerWidth, playerHeight]; // width and height of the player
  private _position = [45, 45]; // starting x and y position of the player relative to top left corner
  private _delayMove = 700; // time it takes to move from one tile to another in ms

  get tileFrom() {
    return this._tileFrom;
  }

  set tileFrom(value) {
    this._tileFrom = value;
  }

  get tileTo() {
    return this._tileTo;
  }

  set tileTo(value) {
    this._tileTo = value;
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

  placeAt(x: number, y: number) {
    this._tileFrom = [x, y];
    this._tileTo = [x, y];
    this._position = [
      tileWidth * x + (tileWidth - this.dimensions[0]) / 2,
      tileWidth * y + (tileWidth - this.dimensions[1]) / 2,
    ];
  }

  /**
   * if player is moving return true else false
   * @param t current time
   * @returns boolean
   */
  processMovement(t: number) {
    // check if player is moving (current tile is different from next tile)
    if (this.tileFrom[0] === this.tileTo[0] && this.tileFrom[1] === this.tileTo[1]) {
      return false;
    }

    // check if time elapsed is greater than the time it takes to move 1 tile
    if (t - this.timeMoved >= this.delayMove) {
      // character has moved to the next tile
      this.placeAt(this.tileTo[0], this.tileTo[1]);
    } else {
      // character is moving to the next tile
      this.position[0] = this.tileFrom[0] * tileWidth + (tileWidth - this.dimensions[0]) / 2;
      this.position[1] = this.tileFrom[1] * tileWidth + (tileWidth - this.dimensions[1]) / 2;

      // check horizontal movement
      if (this.tileTo[0] !== this.tileFrom[0]) {
        const diff = (tileWidth / this.delayMove) * (t - this.timeMoved);
        this.position[0] += this.tileTo[0] < this.tileFrom[0] ? 0 - diff : diff;
      }

      // check vertical movement
      if (this.tileTo[1] !== this.tileFrom[1]) {
        const diff = (tileWidth / this.delayMove) * (t - this.timeMoved);
        this.position[1] += this.tileTo[1] < this.tileFrom[1] ? 0 - diff : diff;
      }

      // round the position to the nearest whole number
      this.position[0] = Math.round(this.position[0]);
      this.position[1] = Math.round(this.position[1]);
    }

    return true;
  }
}
