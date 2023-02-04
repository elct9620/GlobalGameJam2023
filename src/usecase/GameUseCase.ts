import { inject, injectable } from 'inversify'
import 'reflect-metadata';
import * as uuid from 'uuid';

import type { IGameRepository } from '../repository'
import * as types from '../types'

@injectable()
export class GameUseCase {
  private readonly repo: IGameRepository;

  constructor(
    @inject(types.IGameRepository) repo: IGameRepository
  ) {
    this.repo = repo
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
}
