import { Game, Enemy } from '../entities'

export class SeekService {
  private readonly game: Game
  readonly tolerateLater: number

  constructor(game: Game, tolerateLater: number) {
    this.game = game
    this.tolerateLater = tolerateLater
  }

  findSeekIndex(currentTime: number): number {
    const enemies = this.game.enemies
    const enemiesCount = enemies.length
    let idx = this.game.seekIndex

    for(; idx < enemiesCount; idx++) {
      const enemy = enemies[idx]
      if(currentTime <= enemy.time + this.tolerateLater) {
        break
      }
    }

    return idx >= enemiesCount ? enemiesCount - 1 : idx
  }

  findMissed(from: number, to: number): Enemy[] {
    const enemies = this.game.enemies
    let missed: Enemy[] = []
    let idx = from

    for(; idx < to; idx++) {
      if(enemies[idx].captured) {
        continue
      }

      missed.push(enemies[idx])
    }

    return missed
  }
}
