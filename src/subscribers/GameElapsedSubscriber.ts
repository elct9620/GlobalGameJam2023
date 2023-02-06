import { inject, injectable } from 'inversify'
import 'reflect-metadata'
import { Observer } from 'rxjs'

import { TickPayload } from '../events'
import { GameUseCase, SessionUseCase } from '../usecase'

@injectable()
export class GameElapsedSubscriber implements Observer<TickPayload> {
  private readonly game: GameUseCase;
  private readonly session: SessionUseCase;

  constructor(
    @inject(GameUseCase) game: GameUseCase,
    @inject(SessionUseCase) session: SessionUseCase
  ) {
    this.game = game
    this.session = session
  }

  next(event: TickPayload) {
    const id = this.session.CurrentGameID()
    if(id) {
      this.game.ElapseGameTime(id, event.deltaMS)
      this.game.CheckMissed(id)
    }
  }

  error = (_err: Error) => {}
  complete = () => {}
}
