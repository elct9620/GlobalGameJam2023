import { Subject } from 'rxjs'
import { inject, injectable } from 'inversify'
import 'reflect-metadata';

import { IGameRepository } from './IGameRepository'
import { Game } from '../entities'
import { GameCreatedEvent } from '../events'
import { GameCreatedEvent as GameCreatedEventType } from '../types'

type GameCollection = { [key: string]: Game }

@injectable()
export class InMemoryGameRepository implements IGameRepository {
  private collection: GameCollection = {}
  private evtGameCreated: Subject<GameCreatedEvent>

  constructor(
    @inject(GameCreatedEventType) evtGameCreated: Subject<GameCreatedEvent>
  ) {
    this.evtGameCreated = evtGameCreated
  }

  Find(id: string): Game | undefined {
    return this.collection[id]
  }

  Create(id: string): Game {
    if(this.collection[id]) {
      throw Error('duplicated game id')
    }

    this.collection[id] = new Game(id)
    this.evtGameCreated.next({ id })
    return this.collection[id]
  }
}
