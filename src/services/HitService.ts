import { Game, Enemy } from '../entities'

export class HitService {
  private readonly game: Game
  readonly tolerateEarly: number
  readonly tolerateLater: number

  constructor(game: Game, tolerateEarly: number, tolerateLater: number) {
    this.game = game
    this.tolerateEarly = tolerateEarly
    this.tolerateLater = tolerateLater
  }

  findHittedEnemy(): number {
    const enemies = this.game.enemies
    const currentTime = this.game.seekTime

    for(let index in enemies) {
      const enemy = enemies[index]
      if(this.isHitted(enemy, currentTime)) {
        return Number(index)
      }
    }

    return -1
  }

  private isHitted(enemy: Enemy, currentTime: number): boolean {
    return currentTime - this.tolerateEarly <= enemy.time &&
           currentTime + this.tolerateLater >= enemy.time &&
           !enemy.captured
  }
}
