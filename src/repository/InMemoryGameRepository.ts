import { Subject } from 'rxjs'
import { inject, injectable } from 'inversify'
import 'reflect-metadata';

import { IGameRepository } from './IGameRepository'
import { Game, GameState, Enemy } from '../entities'
import {
  GameCreatedEvent,
  GameStartedEvent,
  GameEndedEvent,
  GameHittedEvent,
  GameMissedEvent,
  SpawnChickenEvent,
} from '../events'
import {
  GameCreatedEvent as GameCreatedEventType,
  GameStartedEvent as GameStartedEventType,
  GameEndedEvent as GameEndedEventType,
  GameHittedEvent as GameHittedEventType,
  GameMissedEvent as GameMissedEventType,
  SpawnChickenEvent as SpawnChickenEventType,
} from '../types'

type GameCollection = { [key: string]: Game }

@injectable()
export class InMemoryGameRepository implements IGameRepository {
  private collection: GameCollection = {}
  private readonly evtGameCreated: Subject<GameCreatedEvent>
  private readonly evtGameStarted: Subject<GameStartedEvent>
  private readonly evtGameEnded: Subject<GameEndedEvent>
  private readonly evtGameHitted: Subject<GameHittedEvent>
  private readonly evtGameMissed: Subject<GameMissedEvent>
  private readonly evtSpawnChicken: Subject<SpawnChickenEvent>

  constructor(
    @inject(GameCreatedEventType) evtGameCreated: Subject<GameCreatedEvent>,
    @inject(GameStartedEventType) evtGameStarted: Subject<GameStartedEvent>,
    @inject(GameEndedEventType) evtGameEnded: Subject<GameEndedEvent>,
    @inject(GameHittedEventType) evtGameHitted: Subject<GameHittedEvent>,
    @inject(GameMissedEventType) evtGameMissed: Subject<GameMissedEvent>,
    @inject(SpawnChickenEventType) evtSpawnChicken: Subject<SpawnChickenEvent>,
  ) {
    this.evtGameCreated = evtGameCreated
    this.evtGameStarted = evtGameStarted
    this.evtGameEnded = evtGameEnded
    this.evtGameHitted = evtGameHitted
    this.evtGameMissed = evtGameMissed
    this.evtSpawnChicken = evtSpawnChicken
  }

  Find(id: string): Game {
    if(this.collection[id]) {
      return this.collection[id]
    }

    throw Error('game not found')
  }

  Create(id: string): Game {
    if(this.collection[id]) {
      throw Error('duplicated game id')
    }

    this.collection[id] = new Game(id)
    this.evtGameCreated.next({ id })
    return this.collection[id]
  }

  RefreshState(game: Game) {
    switch(game.state) {
      case GameState.Started:
        this.evtGameStarted.next({ id: game.ID })
        break
    }
  }

  RefreshSeekState(game: Game, missed: number[]) {
    missed.forEach(index => {
      this.evtGameMissed.next({
        id: game.ID,
        index,
      })
    })

    if(game.mayEnded) {
      if(!game.enemies[game.seekIndex].captured) {
        this.evtGameMissed.next({
          id: game.ID,
          index: game.seekIndex,
        })
      }

      this.evtGameEnded.next({ id: game.ID })
    }
  }

  CommitSpawn(game: Game, index: number) {
    const enemy = game.enemies[index]
    this.evtSpawnChicken.next({ index, position: enemy.toPosition() })
  }

  SaveCaptured(game: Game, index: number) {
    this.evtGameHitted.next({
      id: game.ID,
      index,
    })
  }
}
