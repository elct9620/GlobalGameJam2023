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
}
export const emitGameStarted = (payload: GameStartedPayload) => publish(GameStartedEvent, payload)
export const onGameStarted = (observer: Observer<GameStartedPayload>) => subscribe<GameStartedPayload>(GameStartedEvent, observer)

type Score = {
  captured: number
  missed: number
  total: number
}

export const GameEndedEvent = Symbol('Game::GameEndedEvent')
export type GameEndedPayload = {
  id: string
  endedAt: number
  score: Score
}
export const emitGameEnded = (payload: GameEndedPayload) => publish(GameEndedEvent, payload)
export const onGameEnded = (observer: Observer<GameEndedPayload>) => subscribe<GameEndedPayload>(GameEndedEvent, observer)

export const GameHitEvent = Symbol('Game::HitEvent')
export type GameHitPayload = {
  id: string
}
export const emitGameHit = (payload: GameHitPayload) => publish(GameHitEvent, payload)
export const onGameHit = (observer: Observer<GameHitPayload>) => subscribe<GameHitPayload>(GameHitEvent, observer)

export const GameHittedEvent = Symbol('Game::HittedEvent')
export type GameHittedPayload = {
  id: string,
  index: number
}
export const emitGameHitted = (payload: GameHittedPayload) => publish(GameHittedEvent, payload)
export const onGameHitted = (observer: Observer<GameHittedPayload>) => subscribe<GameHittedPayload>(GameHittedEvent, observer)

export type GameMissedEvent = {
  id: string
  index: number
}

export const SeekEvent = Symbol('Game::SeekEvent')
export type SeekPayload = {
  currentTime: number
}
export const emitSeek = (payload: SeekPayload) => publish(SeekEvent, payload)
export const onSeek = (observer: Observer<SeekPayload>) => subscribe(SeekEvent, observer)

type Position = {
  x: number
  y: number
}

export type SpawnChickenEvent = {
  index: number
  position: Position
}

type Note = {
  time: number
}

export const LoadTrackEvent = Symbol('Game::LoadTrackEvent')
export type LoadTrackPayload = {
  id: string
  notes: Note[]
}
export const emitLoadTrack = (payload: LoadTrackPayload) => publish(LoadTrackEvent, payload)
export const onLoadTrack = (observer: Observer<LoadTrackPayload>) => subscribe(LoadTrackEvent, observer)
