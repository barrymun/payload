import { Player } from "./player";
import { MovementKeys } from "./utils/types";

export class State {
  private _ctx: CanvasRenderingContext2D;
  private _currentSecond = 0;
  private _frameCount = 0;
  private _framesLastSecond = 0;
  private _lastFrameTime = 0; // keep track of the time the last frame was drawn in ms
  private _keysDown: Record<MovementKeys, boolean> = {
    ArrowLeft: false,
    ArrowUp: false,
    ArrowRight: false,
    ArrowDown: false,
  }; // check if the keys are currently depressed
  private _player: Player;

  constructor(ctx: CanvasRenderingContext2D) {
    this._ctx = ctx;
    this._player = new Player();
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

  get lastFrameTime() {
    return this._lastFrameTime;
  }

  set lastFrameTime(value) {
    this._lastFrameTime = value;
  }

  get keysDown() {
    return this._keysDown;
  }

  set keysDown(value) {
    this._keysDown = value;
  }

  get player() {
    return this._player;
  }

  set player(value) {
    this._player = value;
  }
}
