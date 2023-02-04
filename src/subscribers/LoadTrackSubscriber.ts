import { inject, injectable } from 'inversify'
import 'reflect-metadata'
import { Observer } from 'rxjs'

import { LoadTrackEvent } from '../events'
import { GameUseCase, SessionUseCase } from '../usecase'

@injectable()
export class LoadTrackSubscriber implements Observer<LoadTrackEvent> {
  private readonly game: GameUseCase
  private readonly session: SessionUseCase;

  constructor(
    @inject(GameUseCase) game: GameUseCase,
    @inject(SessionUseCase) session: SessionUseCase
  ) {
    this.game = game
    this.session = session
  }

  next(event: LoadTrackEvent) {
    const id = this.session.CurrentGameID()
    if(id) {
      this.game.SetTrack(id, event.id)
    }
  }

  error = (_err: Error) => {}
  complete = () => {}
}
