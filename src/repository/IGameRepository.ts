import { Game } from '../entities'

export interface IGameRepository {
  Find(id: string): Game | undefined
  Create(id: string): Game
}
