import { inject, injectable } from 'inversify'
import 'reflect-metadata'
import { Observer } from 'rxjs'

import { SeekEvent } from '../events'
import { GameUseCase, SessionUseCase } from '../usecase'

@injectable()
export class SeekSubscriber implements Observer<SeekEvent> {
  private readonly gameUsecase: GameUseCase;
  private readonly sessionUsecase: SessionUseCase;

  constructor(
    @inject(GameUseCase) gameUsecase: GameUseCase,
    @inject(SessionUseCase) sessionUsecase: SessionUseCase
  ) {
    this.gameUsecase = gameUsecase
    this.sessionUsecase = sessionUsecase
  }

  next(event: SeekEvent) {
    const id = this.sessionUsecase.CurrentGameID()
    if(id) {
      this.gameUsecase.SyncSeek(id, event.currentTime)
    }
  }

  error = (_err: Error) => {}
  complete = () => {}
}
