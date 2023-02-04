import { Game, Enemy } from '../entities'

export class HitService {
  static readonly TOLERATE_EARLY = 500
  static readonly TOLERATE_LATER = 500

  private readonly game: Game

  constructor(game: Game) {
    this.game = game
  }

  findHittedEnemy(): number {
    const enemies = this.game.enemies
    const currentTime = this.game.seekTime
    let [min, max] = [0, enemies.length - 1]
    let mid = 0
    while(min < max) {
      mid = Math.floor((min + max) / 2)
      const enemy = enemies[mid]

      if(this.isHitted(enemy, currentTime)) {
        max = mid
      } else {
        min = mid + 1
      }
    }

    return min
  }

  private isHitted(enemy: Enemy, currentTime: number): boolean {
    return currentTime - HitService.TOLERATE_EARLY <= enemy.time &&
           currentTime + HitService.TOLERATE_LATER >= enemy.time
  }
}
