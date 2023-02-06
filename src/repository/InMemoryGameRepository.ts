import { injectable } from 'inversify'
import 'reflect-metadata';

import { IGameRepository } from './IGameRepository'
import { Game, GameState } from '../entities'
import {
  emitGameCreated,
  emitGameStarted,
  emitGameEnded,
  emitGameHitted,
  emitGameMissed,
  emitSpawnChicken,
} from '../events'

type GameCollection = { [key: string]: Game }

@injectable()
export class InMemoryGameRepository implements IGameRepository {
  private collection: GameCollection = {}

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
    emitGameCreated({ id })
    return this.collection[id]
  }

  RefreshState(game: Game) {
    switch(game.state) {
      case GameState.Started:
        emitGameStarted({ id: game.ID })
        break
    }
  }

  RefreshSeekState(game: Game, missed: number[]) {
    missed.forEach(index => {
      emitGameMissed({
        id: game.ID,
        index,
      })
    })

    if(game.mayEnded) {
      if(!game.enemies[game.seekIndex]?.captured) {
        emitGameMissed({
          id: game.ID,
          index: game.seekIndex,
        })
      }

      emitGameEnded({
        id: game.ID,
        endedAt: game.endedTime,
        score: {
          captured: game.capturedCount,
          missed: game.missedCount,
          total: game.totalCount,
        }
      })
    }
  }

  CommitSpawn(game: Game, index: number) {
    const enemy = game.enemies[index]
    emitSpawnChicken({ index, position: enemy.toPosition() })
  }

  SaveCaptured(game: Game, index: number) {
    emitGameHitted({
      id: game.ID,
      index,
    })
  }
}
