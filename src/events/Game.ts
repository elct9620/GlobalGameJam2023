export type GameCreatedEvent = {
  id: string
}

export type GameStartedEvent = {
  id: string
}

type Score = {
  captured: number
  missed: number
  total: number
}

export type GameEndedEvent = {
  id: string
  endedAt: number
  score: Score
}

export type GameHitEvent = {
  id: string
}

export type GameHittedEvent = {
  id: string,
  index: number
}

export type GameMissedEvent = {
  id: string
  index: number
}

export type SeekEvent = {
  currentTime: number
}

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

export type LoadTrackEvent = {
  id: string
  notes: Note[]
}
