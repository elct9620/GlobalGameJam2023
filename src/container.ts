import { Container } from 'inversify'
import { Subject } from 'rxjs'
import 'reflect-metadata'

import * as usecase from './usecase'
import * as events from './events'
import * as types from './types'
import * as repo from './repository'

const container = new Container({ skipBaseClassChecks: true })

// Events
container.bind<Subject<events.TickEvent>>(types.TickEvent).toConstantValue(new Subject<events.TickEvent>())

container.bind<Subject<events.GameCreatedEvent>>(types.GameCreatedEvent).toConstantValue(new Subject<events.GameCreatedEvent>())
container.bind<Subject<events.GameStartedEvent>>(types.GameStartedEvent).toConstantValue(new Subject<events.GameStartedEvent>())
container.bind<Subject<events.GameHitEvent>>(types.GameHitEvent).toConstantValue(new Subject<events.GameHitEvent>())

container.bind<Subject<events.LoadTrackEvent>>(types.LoadTrackEvent).toConstantValue(new Subject<events.LoadTrackEvent>())

container.bind<Subject<events.KeyboardEvent>>(types.KeyboardEvent).toConstantValue(new Subject<events.KeyboardEvent>())

// Repository
container.bind<repo.IGameRepository>(types.IGameRepository).to(repo.InMemoryGameRepository).inSingletonScope()
container.bind<repo.IPlayerRepository>(types.IPlayerRepository).to(repo.SingletonPlayerRepository).inSingletonScope()
container.bind<repo.ITrackRepository>(types.ITrackRepository).to(repo.InMemoryTrackRepository).inSingletonScope()

// UseCase
container.bind<usecase.GameUseCase>(usecase.GameUseCase).to(usecase.GameUseCase)
container.bind<usecase.SessionUseCase>(usecase.SessionUseCase).to(usecase.SessionUseCase)
container.bind<usecase.TrackUseCase>(usecase.TrackUseCase).to(usecase.TrackUseCase)

export default container
