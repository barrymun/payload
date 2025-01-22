import { State } from "@state";
import { mapHeight, mapWidth, tileHeight, tileWidth } from "@utils/consts";

export class Viewport {
  private _state: State;
  private _screen = [0, 0]; // dimensions of the drawing area (the canvas)
  private _startTile = [0, 0]; // top left tile position of the visible area
  private _endTile = [0, 0]; // bottom right tile position of the visible area
  private _offset = [0, 0]; // the x and y offset in pixels from the dead centre of the screen at which all tiles and map objects are drawn

  constructor(state: State) {
    this._state = state;
  }

  get state() {
    return this._state;
  }

  set state(value) {
    this._state = value;
  }

  get screen() {
    return this._screen;
  }

  set screen(value) {
    this._screen = value;
  }

  get startTile() {
    return this._startTile;
  }

  set startTile(value) {
    this._startTile = value;
  }

  get endTile() {
    return this._endTile;
  }

  set endTile(value) {
    this._endTile = value;
  }

  get offset() {
    return this._offset;
  }

  set offset(value) {
    this._offset = value;
  }

  /**
   * @param px pixel position on the map relative to the top left corner
   * @param py ...
   */
  update(px: number, py: number) {
    this.offset[0] = Math.floor(this.screen[0] / 2 - px);
    this.offset[1] = Math.floor(this.screen[1] / 2 - py);

    // get the tile which is under the dead centre of the updated camera position
    const tile = [Math.floor(px / tileWidth), Math.floor(py / tileHeight)];
    this.startTile[0] = tile[0] - 1 - Math.ceil(this.screen[0] / 2 / tileWidth);
    this.startTile[1] = tile[1] - 1 - Math.ceil(this.screen[1] / 2 / tileHeight);

    if (this.startTile[0] < 0) {
      this.startTile[0] = 0;
    }

    if (this.startTile[1] < 0) {
      this.startTile[1] = 0;
    }

    this.endTile[0] = tile[0] + 1 + Math.ceil(this.screen[0] / 2 / tileWidth);
    this.endTile[1] = tile[1] + 1 + Math.ceil(this.screen[1] / 2 / tileHeight);

    if (this.endTile[0] >= mapWidth) {
      this.endTile[0] = mapWidth - 1;
    }

    if (this.endTile[1] >= mapHeight) {
      this.endTile[1] = mapHeight - 1;
    }
  }
}
