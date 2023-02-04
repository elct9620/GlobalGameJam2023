import { Subject } from 'rxjs'

import Container from '../container'
import * as subscribers from '../subscribers'
import * as events from '../events'
import * as types from '../types'

Container.bind<subscribers.GameElapsedSubscriber>(subscribers.GameElapsedSubscriber).to(subscribers.GameElapsedSubscriber)
Container.get<Subject<events.TickEvent>>(types.TickEvent).subscribe(
  Container.resolve<subscribers.GameElapsedSubscriber>(subscribers.GameElapsedSubscriber)
)

Container.bind<subscribers.GameCreatedSubscriber>(subscribers.GameCreatedSubscriber).to(subscribers.GameCreatedSubscriber)
Container.get<Subject<events.GameCreatedEvent>>(types.GameCreatedEvent).subscribe(
  Container.resolve<subscribers.GameCreatedSubscriber>(subscribers.GameCreatedSubscriber)
)

Container.bind<subscribers.InputSubscriber>(subscribers.InputSubscriber).to(subscribers.InputSubscriber)
Container.get<Subject<events.KeyboardEvent>>(types.KeyboardEvent).subscribe(
  Container.resolve<subscribers.InputSubscriber>(subscribers.InputSubscriber)
)
