import { inject, injectable } from 'inversify'
import 'reflect-metadata'
import { Observer } from 'rxjs'

import { GameStartedPayload } from '../events'
import { GameUseCase, SessionUseCase } from '../usecase'

@injectable()
export class GameStartedSubscriber implements Observer<GameStartedPayload> {
  private readonly game: GameUseCase;
  private readonly session: SessionUseCase;

  constructor(
    @inject(GameUseCase) game: GameUseCase,
    @inject(SessionUseCase) session: SessionUseCase
  ) {
    this.game = game
    this.session = session
  }

  next(_event: GameStartedPayload) {
    const id = this.session.CurrentGameID()
    if(id) {
      this.game.SpawnChicken(id)
    }
  }

  error = (_err: Error) => {}
  complete = () => {}
}
