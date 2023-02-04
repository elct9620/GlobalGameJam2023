import { injectable } from 'inversify'
import 'reflect-metadata';

@injectable()
export class GameUseCase {
  CreateGame(): boolean {
    return true
  }
}
