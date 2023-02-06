import Container from '../container'
import * as subscribers from '../core/subscribers'
import * as events from '../events'

events.onTick(Container.resolve<subscribers.GameElapsedSubscriber>(subscribers.GameElapsedSubscriber))
events.onInput(Container.resolve<subscribers.InputSubscriber>(subscribers.InputSubscriber))

events.onGameCreated(Container.resolve<subscribers.GameCreatedSubscriber>(subscribers.GameCreatedSubscriber))
events.onGameStarted(Container.resolve<subscribers.GameStartedSubscriber>(subscribers.GameStartedSubscriber))

events.onLoadTrack(Container.resolve<subscribers.LoadTrackSubscriber>(subscribers.LoadTrackSubscriber))
