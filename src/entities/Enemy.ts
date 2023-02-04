
type Position = {
  x: number
  y: number
}

export class Enemy {
  static readonly TIME_SCALE = 0.1
  static readonly TRACK_SCALE = 4

  public readonly time: number
  public readonly captured: boolean

  constructor(time: number, captured: boolean = false) {
    this.time = time
    this.captured = captured
  }

  toPosition(): Position {
    return {
      x: this.time * Enemy.TIME_SCALE * Enemy.TRACK_SCALE,
      y: 0,
    }
  }

  capture(): Enemy {
    return new Enemy(this.time, true)
  }
}
