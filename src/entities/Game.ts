import { Enemy } from './Enemy'

export enum GameState {
  Created = 0,
  Started,
  Ended
}

export class Game {
  readonly ID: string;

  private _currentTrackID?: string;
  private _elapsedTime: number = 0
  private _seekTime: number = 0
  private _state: GameState = GameState.Created
  private _enemies: Enemy[] = []

  constructor(id: string) {
    this.ID = id
  }

  get state(): GameState {
    return this._state
  }

  get enemies(): Enemy[] {
    return [...this._enemies]
  }

  get currentTrackID(): string | undefined {
    return this._currentTrackID
  }

  get elapsedTime(): number {
    return this._elapsedTime
  }

  get seekTime(): number {
    return this._seekTime
  }

  get canStart(): boolean {
    return this._state == GameState.Created && !!this.currentTrackID
  }

  get isStarted(): boolean {
    return this._state == GameState.Started
  }

  get canAction(): boolean {
    return this.isStarted
  }

  start() {
    if(this.canStart) {
      this._state = GameState.Started
    }
  }

  elapsed(delta: number): number {
    if(this.isStarted) {
      return this._elapsedTime += delta
    }

    return -1
  }

  seekTo(currentTime: number): number {
    return this._seekTime = currentTime
  }

  setTrack(id: string) {
    this._currentTrackID = id
  }

  spawn(time: number): number {
    this._enemies.push(new Enemy(time))
    return this._enemies.length - 1
  }
}
