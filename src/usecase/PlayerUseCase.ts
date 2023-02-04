import { inject, injectable } from 'inversify'
import 'reflect-metadata';

import type { IPlayerRepository } from '../repository'
import * as types from '../types'


@injectable()
export class PlayerUseCase {
  private readonly repo: IPlayerRepository;

  constructor(
    @inject(types.IPlayerRepository) repo: IPlayerRepository
  ) {
    this.repo = repo
  }

  Init(): string {
    const player = this.repo.Create('__LOCAL_PLAYER__')
    return player.ID
  }
}
