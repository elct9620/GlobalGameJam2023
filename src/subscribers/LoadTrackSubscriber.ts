import { inject, injectable } from 'inversify'
import 'reflect-metadata'
import { Observer } from 'rxjs'

import { LoadTrackPayload } from '../events'
import { GameUseCase, SessionUseCase, TrackUseCase } from '../usecase'

@injectable()
export class LoadTrackSubscriber implements Observer<LoadTrackPayload> {
  private readonly game: GameUseCase
  private readonly session: SessionUseCase;
  private readonly track: TrackUseCase

  constructor(
    @inject(GameUseCase) game: GameUseCase,
    @inject(SessionUseCase) session: SessionUseCase,
    @inject(TrackUseCase) track: TrackUseCase,
  ) {
    this.game = game
    this.session = session
    this.track = track
  }

  next(event: LoadTrackPayload) {
    const id = this.session.CurrentGameID()
    if(id) {
      this.track.Load(event.id, event.notes)
      this.game.SetTrack(id, event.id)
    }
  }

  error = (_err: Error) => {}
  complete = () => {}
}
