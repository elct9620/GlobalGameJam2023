import { Container } from 'inversify'
import 'reflect-metadata'

import * as usecase from './core/usecase'
import * as types from './core/types'
import * as repo from './core/repository'

const container = new Container({ skipBaseClassChecks: true })

// Repository
container.bind<repo.IGameRepository>(types.IGameRepository).to(repo.InMemoryGameRepository).inSingletonScope()
container.bind<repo.IPlayerRepository>(types.IPlayerRepository).to(repo.SingletonPlayerRepository).inSingletonScope()
container.bind<repo.ITrackRepository>(types.ITrackRepository).to(repo.InMemoryTrackRepository).inSingletonScope()

// UseCase
container.bind<usecase.GameUseCase>(usecase.GameUseCase).to(usecase.GameUseCase)
container.bind<usecase.SessionUseCase>(usecase.SessionUseCase).to(usecase.SessionUseCase)
container.bind<usecase.TrackUseCase>(usecase.TrackUseCase).to(usecase.TrackUseCase)

export default container
