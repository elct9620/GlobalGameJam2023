import { inject, injectable } from 'inversify'
import 'reflect-metadata'
import { Observer } from 'rxjs'

import { KeyboardEvent } from '../events'
import { GameUseCase, SessionUseCase } from '../usecase'

@injectable()
export class InputSubscriber implements Observer<KeyboardEvent> {
  static ALLOW_KEYS = [' ']

  private readonly game: GameUseCase
  private readonly session: SessionUseCase;

  constructor(
    @inject(GameUseCase) game: GameUseCase,
    @inject(SessionUseCase) session: SessionUseCase
  ) {
    this.game = game
    this.session = session
  }

  next(event: KeyboardEvent) {
    if(InputSubscriber.ALLOW_KEYS.includes(event.key) && !event.pressed) {
      const id = this.session.CurrentGameID()
      if(id) {
        this.game.Hit(id)
      }
    }
  }

  error = (_err: Error) => {}
  complete = () => {}
}
