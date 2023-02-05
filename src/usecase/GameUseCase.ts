import { Subject } from 'rxjs'
import { inject, injectable } from 'inversify'
import 'reflect-metadata';
import * as uuid from 'uuid';

import { Enemy } from '../entities'
import type { IGameRepository, ITrackRepository } from '../repository'
import { HitService, SeekService } from '../services'
import { GameHitEvent } from '../events'
import * as types from '../types'

export type HitResult = {
  type: string
  meta?: { [key: string]: any }
}

export type SeekResult = {
  time: number,
  index: number
}

@injectable()
export class GameUseCase {
  static readonly TOLERATE_EARLY = 500
  static readonly TOLERATE_LATER = 500

  private readonly gameRepo: IGameRepository
  private readonly trackRepo: ITrackRepository
  private readonly evtGameHit: Subject<GameHitEvent>

  constructor(
    @inject(types.IGameRepository) gameRepo: IGameRepository,
    @inject(types.ITrackRepository) trackRepo: ITrackRepository,
    @inject(types.GameHitEvent) evtGameHit: Subject<GameHitEvent>,
  ) {
    this.gameRepo = gameRepo
    this.trackRepo = trackRepo
    this.evtGameHit = evtGameHit
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
      const target = service.findHittedEnemy()
      const index = game.capture(target)
      if(index > 0) {
        this.gameRepo.SaveCaptured(game, index)
      }

      this.evtGameHit.next({ id })

      return { type: 'action', meta: { index } }
    }

    return { type: 'error' }
  }

  SyncSeek(id: string, currentTime: number): SeekResult {
    const game = this.gameRepo.Find(id)
    if(game.isStarted) {
      const service = new SeekService(game, GameUseCase.TOLERATE_LATER)
      const time = game.seekTo(currentTime)

      const currentIndex = game.seekIndex
      const index = service.findSeekIndex(currentTime)
      const missed: Enemy[] = service.findMissed(currentIndex, index)

      game.updateSeekState(index)
      this.gameRepo.RefreshSeekState(game, missed)

      return { time, index }
    }

    return { time: 0, index: -1 }
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
