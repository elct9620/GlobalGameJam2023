import { injectable } from 'inversify'
import 'reflect-metadata'
import { Observer } from 'rxjs'

import { KeyboardEvent } from '../events'

@injectable()
export class InputSubscriber implements Observer<KeyboardEvent> {
  next(_event: KeyboardEvent) {
  }

  error = (_err: Error) => {}
  complete = () => {}
}
