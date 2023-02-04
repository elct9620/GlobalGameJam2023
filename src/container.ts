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

// Repository
container.bind<repo.IGameRepository>(types.IGameRepository).to(repo.InMemoryGameRepository).inSingletonScope()

// UseCase
container.bind<usecase.GameUseCase>(usecase.GameUseCase).to(usecase.GameUseCase)

export default container
