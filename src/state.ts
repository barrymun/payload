export class State {
  private _ctx: CanvasRenderingContext2D;
  private _currentSecond = 0;
  private _frameCount = 0;
  private _framesLastSecond = 0;

  constructor({ ctx }: { ctx: CanvasRenderingContext2D }) {
    this._ctx = ctx;
  }

  get ctx() {
    return this._ctx;
  }

  get currentSecond() {
    return this._currentSecond;
  }

  set currentSecond(value) {
    this._currentSecond = value;
  }

  get frameCount() {
    return this._frameCount;
  }

  set frameCount(value) {
    this._frameCount = value;
  }

  get framesLastSecond() {
    return this._framesLastSecond;
  }

  set framesLastSecond(value) {
    this._framesLastSecond = value;
  }
}
