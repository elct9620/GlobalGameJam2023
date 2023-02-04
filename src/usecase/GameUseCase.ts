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

  CreateGame(): boolean {
    const newGame = this.repo.Create(uuid.v4())
    return !!newGame
  }
}
