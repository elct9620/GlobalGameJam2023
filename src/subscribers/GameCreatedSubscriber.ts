import { inject, injectable } from 'inversify'
import 'reflect-metadata'
import { Observer } from 'rxjs'

import { GameCreatedPayload } from '../events'
import { SessionUseCase } from '../usecase'

@injectable()
export class GameCreatedSubscriber implements Observer<GameCreatedPayload> {
  private readonly session: SessionUseCase;

  constructor(
    @inject(SessionUseCase) session: SessionUseCase
  ) {
    this.session = session
  }

  next(event: GameCreatedPayload) {
    this.session.StartGame(event.id)
  }

  error = (_err: Error) => {}
  complete = () => {}
}
