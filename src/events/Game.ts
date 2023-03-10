import { publish, subscribe, Observer } from '../stream'

export const GameCreatedEvent = Symbol('Game::CreatedEvent')
export type GameCreatedPayload = {
  id: string
}
export const emitGameCreated = (payload: GameCreatedPayload) => publish(GameCreatedEvent, payload)
export const onGameCreated = (observer: Observer<GameCreatedPayload>) => subscribe<GameCreatedPayload>(GameCreatedEvent, observer)

export const GameStartedEvent = Symbol('Game::StartedEvent')
export type GameStartedPayload = {
  id: string
  startedAt: number
}
export const emitGameStarted = (payload: GameStartedPayload) => publish(GameStartedEvent, payload)
export const onGameStarted = (observer: Observer<GameStartedPayload>) => subscribe<GameStartedPayload>(GameStartedEvent, observer)

export const GameEndedEvent = Symbol('Game::GameEndedEvent')
export type GameEndedPayload = {
  id: string
  endedAt: number
  score: {
    captured: number
    missed: number
    total: number
  }
}
export const emitGameEnded = (payload: GameEndedPayload) => publish(GameEndedEvent, payload)
export const onGameEnded = (observer: Observer<GameEndedPayload>) => subscribe<GameEndedPayload>(GameEndedEvent, observer)

export const GameHittedEvent = Symbol('Game::HittedEvent')
export type GameHittedPayload = {
  id: string,
  index: number
}
export const emitGameHitted = (payload: GameHittedPayload) => publish(GameHittedEvent, payload)
export const onGameHitted = (observer: Observer<GameHittedPayload>) => subscribe<GameHittedPayload>(GameHittedEvent, observer)

export const GameMissedEvent = Symbol('Game::MissedEvent')
export type GameMissedPayload = {
  id: string
  index: number
}
export const emitGameMissed = (payload: GameMissedPayload) => publish(GameMissedEvent, payload)
export const onGameMissed = (observer: Observer<GameMissedPayload>) => subscribe<GameMissedPayload>(GameMissedEvent, observer)

export const SpawnChickenEvent = Symbol('Game::SpawnChickenEvent')
export type SpawnChickenPayload = {
  index: number
  position: {
    x: number
    y: number
  }
}
export const emitSpawnChicken = (payload: SpawnChickenPayload) => publish(SpawnChickenEvent, payload)
export const onSpawnChicken = (observer: Observer<SpawnChickenPayload>) => subscribe(SpawnChickenEvent, observer)

export const LoadTrackEvent = Symbol('Game::LoadTrackEvent')
export type LoadTrackPayload = {
  id: string
  notes: { time: number }[]
}
export const emitLoadTrack = (payload: LoadTrackPayload) => publish(LoadTrackEvent, payload)
export const onLoadTrack = (observer: Observer<LoadTrackPayload>) => subscribe(LoadTrackEvent, observer)
