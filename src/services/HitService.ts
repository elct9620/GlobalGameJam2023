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

    for(let index in enemies) {
      const enemy = enemies[index]
      if(this.isHitted(enemy, currentTime)) {
        return Number(index)
      }
    }

    return -1
  }

  private isHitted(enemy: Enemy, currentTime: number): boolean {
    return currentTime - HitService.TOLERATE_EARLY <= enemy.time &&
           currentTime + HitService.TOLERATE_LATER >= enemy.time &&
           !enemy.captured
  }
}
