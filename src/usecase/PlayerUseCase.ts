import { injectable } from 'inversify'
import 'reflect-metadata';

@injectable()
export class PlayerUseCase {
  Init(): boolean {
    return true
  }
}
