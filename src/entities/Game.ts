export class Game {
  readonly ID: string;

  private _elapsedTime: number = 0

  constructor(id: string) {
    this.ID = id
  }

  get elapsedTime(): number {
    return this._elapsedTime
  }

  elapsed(delta: number): number {
    return this._elapsedTime += delta
  }
}
