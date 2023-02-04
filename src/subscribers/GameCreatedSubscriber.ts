import { inject, injectable } from 'inversify'
import 'reflect-metadata'
import { Observer } from 'rxjs'

import { GameCreatedEvent } from '../events'
import { SessionUseCase } from '../usecase'

@injectable()
export class GameCreatedSubscriber implements Observer<GameCreatedEvent> {
  private readonly session: SessionUseCase;

  constructor(
    @inject(SessionUseCase) session: SessionUseCase
  ) {
    this.session = session
  }

  next(event: GameCreatedEvent) {
    console.log('WAT')
    this.session.StartGame(event.id)
  }

  error = (_err: Error) => {}
  complete = () => {}
}
