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
  private _endedTime: number = 0
  private _seekTime: number = 0
  private _seekIndex: number = 0
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

  get endedTime(): number {
    return this._endedTime
  }

  get seekTime(): number {
    return this._seekTime
  }

  get seekIndex(): number {
    return this._seekIndex
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

  get mayEnded(): boolean {
    return this._seekIndex >= this._enemies.length - 1
  }

  get capturedCount(): number {
    return this._enemies.filter(enemy => enemy.captured).length
  }

  get missedCount(): number {
    return this._enemies.filter(enemy => !enemy.captured).length
  }

  get totalCount(): number {
    return this._enemies.length
  }

  start() {
    if(this.canStart) {
      this._state = GameState.Started
    }
  }

  end() {
    if(this.mayEnded) {
      this._endedTime = Date.now()
      this._state = GameState.Ended
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

  updateSeekState(index: number): number {
    if(this._seekIndex > index) {
      return -1
    }

    return this._seekIndex = index
  }

  setTrack(id: string) {
    this._currentTrackID = id
  }

  spawn(time: number): number {
    this._enemies.push(new Enemy(time))
    return this._enemies.length - 1
  }

  capture(index: number): number {
    const enemies = [...this._enemies]
    const enemy = enemies[index]
    if(!enemy) return -1

    enemies[index] = enemy.capture()
    this._enemies = enemies

    return index
  }
}
