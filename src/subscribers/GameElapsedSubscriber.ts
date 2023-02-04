import { injectable } from 'inversify'
import 'reflect-metadata'
import { Observer } from 'rxjs'

import { TickEvent } from '../events'
import { GameUseCase } from '../usecase'

@injectable()
export class GameElapsedSubscriber implements Observer<TickEvent> {
  private readonly usecase: GameUseCase;

  constructor(
    usecase: GameUseCase
  ) {
    this.usecase = usecase
  }

  next(event: TickEvent) {
    this.usecase.ElapseGameTime('__DUMMY__', event.delta)
  }

  error = (_err: Error) => {}
  complete = () => {}
}
