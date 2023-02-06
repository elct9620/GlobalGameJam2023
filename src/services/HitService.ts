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

  findHittedEnemy(seekTime: number): number {
    const enemies = this.game.enemies

    for(let index in enemies) {
      const enemy = enemies[index]
      if(this.isHitted(enemy, seekTime)) {
        return Number(index)
      }
    }

    return -1
  }

  private isHitted(enemy: Enemy, seekTime: number): boolean {
    return seekTime - this.tolerateEarly <= enemy.time &&
           seekTime + this.tolerateLater >= enemy.time &&
           !enemy.captured
  }
}
