import { Game } from '../entities'

export interface IGameRepository {
  Find(id: string): Game
  Create(id: string): Game
  RefreshState(game: Game): void
  CommitSpawn(game: Game, idx: number): void
  SaveCaptured(game: Game, idx: number): void
}
