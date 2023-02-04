export type GameCreatedEvent = {
  id: string
}

export type GameStartedEvent = {
  id: string
}

export type GameHitEvent = {
  id: string
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
