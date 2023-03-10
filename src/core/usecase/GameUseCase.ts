import { inject, injectable } from 'inversify'
import 'reflect-metadata';
import * as uuid from 'uuid';

import type { IGameRepository, ITrackRepository } from '../repository'
import { HitService, SeekService } from '../services'
import * as types from '../types'

export type HitResult = {
  type: string
  meta?: { [key: string]: any }
}

export type CheckMissedResult = {
  index: number
  missed: number
}

@injectable()
export class GameUseCase {
  static readonly TOLERATE_EARLY = 500
  static readonly TOLERATE_LATER = 500

  private readonly gameRepo: IGameRepository
  private readonly trackRepo: ITrackRepository

  constructor(
    @inject(types.IGameRepository) gameRepo: IGameRepository,
    @inject(types.ITrackRepository) trackRepo: ITrackRepository,
  ) {
    this.gameRepo = gameRepo
    this.trackRepo = trackRepo
  }

  CreateGame(): string {
    const newGame = this.gameRepo.Create(uuid.v4())
    return newGame.ID
  }

  ElapseGameTime(id: string, delta: number): number {
    const game = this.gameRepo.Find(id)
    return game.elapsed(delta)
  }

  SetTrack(id: string, trackID: string): string | undefined {
    const game = this.gameRepo.Find(id)
    game.setTrack(trackID)
    return game.currentTrackID
  }

  Hit(id: string): HitResult {
    const game = this.gameRepo.Find(id)
    if(game.canStart) {
      game.start()
      this.gameRepo.RefreshState(game)
      return { type: 'started' }
    }

    if(game.canAction) {
      const service = new HitService(game, GameUseCase.TOLERATE_EARLY, GameUseCase.TOLERATE_LATER)
      const target = service.findHittedEnemy(game.seekTime)
      const index = game.capture(target)
      if(index >= 0) {
        this.gameRepo.SaveCaptured(game, index)
      }

      return { type: 'action', meta: { index } }
    }

    return { type: 'error' }
  }

  CheckMissed(id: string): CheckMissedResult {
    const game = this.gameRepo.Find(id)
    if(game.isStarted) {
      const service = new SeekService(game, GameUseCase.TOLERATE_LATER)

      const currentIndex = game.seekIndex
      const index = service.findSeekIndex(game.seekTime)
      const missed: number[] = service.findMissed(currentIndex, index)

      game.updateSeekState(index)
      if(game.mayEnded) {
        game.end()
      }
      this.gameRepo.RefreshSeekState(game, missed)

      return { index, missed: missed.length }
    }

    return { index: -1, missed: 0 }
  }

  SpawnChicken(id: string): number {
    const game = this.gameRepo.Find(id)
    if(game.currentTrackID) {
      const track = this.trackRepo.Find(game.currentTrackID)
      let spawnCount = 0
      track.notes.forEach(note => {
        const idx = game.spawn(note.time)
        this.gameRepo.CommitSpawn(game, idx)
        spawnCount++
      })
      return spawnCount
    }

    return 0
  }
}
