import { injectable } from 'inversify'
import 'reflect-metadata';

import { IGameRepository } from './IGameRepository'
import { Game } from '../entities'

type GameCollection = { [key: string]: Game }

@injectable()
export class InMemoryGameRepository implements IGameRepository {
  private collection: GameCollection = {}

  Find(id: string): Game | undefined {
    return this.collection[id]
  }

  Create(id: string): Game {
    if(this.collection[id]) {
      throw Error('duplicated game id')
    }

    this.collection[id] = new Game(id)
    return this.collection[id]
  }
}
