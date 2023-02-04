export enum GameState {
  Created = 0,
  Started,
  Ended
}

export class Game {
  readonly ID: string;

  private _elapsedTime: number = 0
  private _state: GameState = GameState.Created

  constructor(id: string) {
    this.ID = id
  }

  get state(): GameState {
    return this._state
  }

  get elapsedTime(): number {
    return this._elapsedTime
  }

  get canStart(): boolean {
    return this._state == GameState.Created
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
}
