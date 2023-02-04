import { Subject } from 'rxjs'
import { inject, injectable } from 'inversify'
import 'reflect-metadata';
import * as uuid from 'uuid';

import type { IGameRepository, ITrackRepository } from '../repository'
import { GameHitEvent } from '../events'
import * as types from '../types'

export type HitResult = {
  type: string
}

@injectable()
export class GameUseCase {
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
      this.evtGameHit.next({ id })
      return { type: 'action' }
    }

    return { type: 'error' }
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
