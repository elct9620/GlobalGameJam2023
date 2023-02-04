import { inject, injectable } from 'inversify'
import 'reflect-metadata';

import type { IPlayerRepository } from '../repository'
import * as types from '../types'

@injectable()
export class SessionUseCase {
  private readonly repo: IPlayerRepository;
  private readonly playerID: string

  constructor(
    @inject(types.IPlayerRepository) repo: IPlayerRepository,
    @inject(types.PlayerID) playerID: string
  ) {
    this.repo = repo
    this.playerID = playerID
  }

  CurrentPlayerID(): string {
    const player = this.repo.Find(this.playerID)
    if(!player) {
      throw Error('player not found')
    }

    return player.ID
  }
}
