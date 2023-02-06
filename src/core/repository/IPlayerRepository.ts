import { Player } from '../entities'

export interface IPlayerRepository {
  Find(id: string): Player | undefined
  Create(id: string): Player
}
