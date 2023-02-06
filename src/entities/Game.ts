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
  private _seekIndex: number = 0
  private _startedAt: number = 0
  private _endedAt: number = 0
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

  get startedAt(): number {
    return this._startedAt
  }

  get endedAt(): number {
    return this._endedAt
  }

  get seekTime(): number {
    return Date.now() - this._startedAt
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
    // FIXME: Last chicken cannot hit, patched by check elapsedTime
    return this._seekIndex >= this._enemies.length - 1 &&
           (this.elapsedTime - (this.enemies[this._enemies.length-1]?.time || 0)) >= 300
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
      this._startedAt = Date.now()
      this._state = GameState.Started
    }
  }

  end() {
    if(this.mayEnded) {
      this._endedAt = Date.now()
      this._state = GameState.Ended
    }
  }

  elapsed(delta: number): number {
    if(!this.isStarted) return -1

    return this._elapsedTime += delta
  }

  updateSeekState(index: number): number {
    if(!this.isStarted) return -1
    if(this._seekIndex > index) {
      return -1
    }

    return this._seekIndex = index
  }

  setTrack(id: string) {
    this._currentTrackID = id
  }

  spawn(time: number): number {
    if(!this.isStarted) return -1

    this._enemies.push(new Enemy(time))
    return this._enemies.length - 1
  }

  capture(index: number): number {
    if(!this.isStarted) return -1

    const enemies = [...this._enemies]
    const enemy = enemies[index]
    if(!enemy) return -1

    enemies[index] = enemy.capture()
    this._enemies = enemies

    return index
  }
}
