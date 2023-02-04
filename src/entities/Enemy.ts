export class Enemy {
  public readonly time: number
  public readonly captured: boolean

  constructor(time: number, captured: boolean = false) {
    this.time = time
    this.captured = captured
  }

  capture(): Enemy {
    return new Enemy(this.time, true)
  }
}
