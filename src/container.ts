import { Container } from 'inversify'
import { Subject } from 'rxjs'
import 'reflect-metadata'

import * as usecase from './usecase'
import * as events from './events'
import * as types from './types'
import * as repo from './repository'

const container = new Container({ skipBaseClassChecks: true })

// Events
container.bind<Subject<events.GameCreatedEvent>>(types.GameCreatedEvent).toConstantValue(new Subject<events.GameCreatedEvent>())
container.bind<Subject<events.GameStartedEvent>>(types.GameStartedEvent).toConstantValue(new Subject<events.GameStartedEvent>())
container.bind<Subject<events.GameEndedEvent>>(types.GameEndedEvent).toConstantValue(new Subject<events.GameEndedEvent>())
container.bind<Subject<events.GameHitEvent>>(types.GameHitEvent).toConstantValue(new Subject<events.GameHitEvent>())
container.bind<Subject<events.GameHittedEvent>>(types.GameHittedEvent).toConstantValue(new Subject<events.GameHittedEvent>())
container.bind<Subject<events.GameMissedEvent>>(types.GameMissedEvent).toConstantValue(new Subject<events.GameMissedEvent>())

container.bind<Subject<events.SeekEvent>>(types.SeekEvent).toConstantValue(new Subject<events.SeekEvent>())
container.bind<Subject<events.SpawnChickenEvent>>(types.SpawnChickenEvent).toConstantValue(new Subject<events.SpawnChickenEvent>())

container.bind<Subject<events.LoadTrackEvent>>(types.LoadTrackEvent).toConstantValue(new Subject<events.LoadTrackEvent>())

// Repository
container.bind<repo.IGameRepository>(types.IGameRepository).to(repo.InMemoryGameRepository).inSingletonScope()
container.bind<repo.IPlayerRepository>(types.IPlayerRepository).to(repo.SingletonPlayerRepository).inSingletonScope()
container.bind<repo.ITrackRepository>(types.ITrackRepository).to(repo.InMemoryTrackRepository).inSingletonScope()

// UseCase
container.bind<usecase.GameUseCase>(usecase.GameUseCase).to(usecase.GameUseCase)
container.bind<usecase.SessionUseCase>(usecase.SessionUseCase).to(usecase.SessionUseCase)
container.bind<usecase.TrackUseCase>(usecase.TrackUseCase).to(usecase.TrackUseCase)

export default container
