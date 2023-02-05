import { inject, injectable } from 'inversify'
import 'reflect-metadata'
import { Observer } from 'rxjs'

import { TickPayload } from '../events'
import { GameUseCase, SessionUseCase } from '../usecase'

@injectable()
export class GameElapsedSubscriber implements Observer<TickPayload> {
  private readonly gameUsecase: GameUseCase;
  private readonly sessionUsecase: SessionUseCase;

  constructor(
    @inject(GameUseCase) gameUsecase: GameUseCase,
    @inject(SessionUseCase) sessionUsecase: SessionUseCase
  ) {
    this.gameUsecase = gameUsecase
    this.sessionUsecase = sessionUsecase
  }

  next(event: TickPayload) {
    const id = this.sessionUsecase.CurrentGameID()
    if(id) {
      this.gameUsecase.ElapseGameTime(id, event.deltaMS)
    }
  }

  error = (_err: Error) => {}
  complete = () => {}
}
