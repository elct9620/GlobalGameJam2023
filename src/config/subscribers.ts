import { Subject } from 'rxjs'

import Container from '../container'
import * as subscribers from '../subscribers'
import * as events from '../events'
import * as types from '../types'

Container.bind<subscribers.GameElapsedSubscriber>(subscribers.GameElapsedSubscriber).to(subscribers.GameElapsedSubscriber)
Container.get<Subject<events.TickEvent>>(types.TickEvent).subscribe(
  Container.resolve<subscribers.GameElapsedSubscriber>(subscribers.GameElapsedSubscriber)
)
