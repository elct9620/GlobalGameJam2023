export class Player {
  readonly ID: string
  private _currentGameID?: string;

  constructor(id: string) {
    this.ID = id
  }

  get currentGameID(): string | undefined {
    return this._currentGameID
  }

  startGame(id: string) {
    this._currentGameID = id
  }
}
