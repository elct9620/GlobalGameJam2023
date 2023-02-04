import { injectable } from 'inversify'
import 'reflect-metadata';

import { IPlayerRepository } from './IPlayerRepository'
import { Player } from '../entities'

@injectable()
export class SingletonPlayerRepository implements IPlayerRepository {
  private _player?: Player;

  Find(_id: string): Player | undefined {
    return this._player
  }

  Create(id: string): Player {
    this._player = new Player(id)
    return this._player
  }
}
