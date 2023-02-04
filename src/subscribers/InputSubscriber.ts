import { inject, injectable } from 'inversify'
import 'reflect-metadata'
import { Observer } from 'rxjs'

import { KeyboardEvent } from '../events'
import { GameUseCase } from '../usecase'

@injectable()
export class InputSubscriber implements Observer<KeyboardEvent> {
  static ALLOW_KEYS = [' ']

  private readonly game: GameUseCase

  constructor(
    @inject(GameUseCase) game: GameUseCase
  ) {
    this.game = game
  }

  next(event: KeyboardEvent) {
    if(InputSubscriber.ALLOW_KEYS.includes(event.key)) {
      this.game.Hit()
    }
  }

  error = (_err: Error) => {}
  complete = () => {}
}
