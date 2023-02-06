import { Subject } from 'rxjs'

import Container from '../container'
import * as subscribers from '../subscribers'
import * as events from '../events'
import * as types from '../types'

events.onTick(Container.resolve<subscribers.GameElapsedSubscriber>(subscribers.GameElapsedSubscriber))
events.onInput(Container.resolve<subscribers.InputSubscriber>(subscribers.InputSubscriber))

events.onGameCreated(Container.resolve<subscribers.GameCreatedSubscriber>(subscribers.GameCreatedSubscriber))

events.onSeek(Container.resolve<subscribers.SeekSubscriber>(subscribers.SeekSubscriber))

Container.bind<subscribers.GameStartedSubscriber>(subscribers.GameStartedSubscriber).to(subscribers.GameStartedSubscriber)
Container.get<Subject<events.GameStartedEvent>>(types.GameStartedEvent).subscribe(
  Container.resolve<subscribers.GameStartedSubscriber>(subscribers.GameStartedSubscriber)
)

Container.bind<subscribers.LoadTrackSubscriber>(subscribers.LoadTrackSubscriber).to(subscribers.LoadTrackSubscriber)
Container.get<Subject<events.LoadTrackEvent>>(types.LoadTrackEvent).subscribe(
  Container.resolve<subscribers.LoadTrackSubscriber>(subscribers.LoadTrackSubscriber)
)
