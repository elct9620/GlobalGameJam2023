import { Subject } from 'rxjs'
import { inject, injectable } from 'inversify'
import 'reflect-metadata';
import * as uuid from 'uuid';

import type { IGameRepository } from '../repository'
import { GameHitEvent } from '../events'
import * as types from '../types'

export type HitResult = {
  type: string
}

@injectable()
export class GameUseCase {
  private readonly repo: IGameRepository
  private readonly evtGameHit: Subject<GameHitEvent>

  constructor(
    @inject(types.IGameRepository) repo: IGameRepository,
    @inject(types.GameHitEvent) evtGameHit: Subject<GameHitEvent>
  ) {
    this.repo = repo
    this.evtGameHit = evtGameHit
  }

  CreateGame(): string {
    const newGame = this.repo.Create(uuid.v4())
    return newGame.ID
  }

  ElapseGameTime(id: string, delta: number): number {
    const game = this.repo.Find(id)
    if (game) return game.elapsed(delta)

    return -1
  }

  SetTrack(id: string, trackID: string): string | undefined {
    const game = this.repo.Find(id)
    if (!game) {
      throw Error('game not found')
    }

    game.setTrack(trackID)
    return game.currentTrackID
  }

  Hit(id: string): HitResult {
    const game = this.repo.Find(id)
    if(game?.canStart) {
      game.start()
      this.repo.RefreshState(game)
      return { type: 'started' }
    }

    if(game?.canAction) {
      this.evtGameHit.next({ id })
      return { type: 'action' }
    }

    return { type: 'error' }
  }
}
