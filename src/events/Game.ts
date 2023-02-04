export type GameCreatedEvent = {
  id: string
}

export type GameStartedEvent = {
  id: string
}

export type GameHitEvent = {
  id: string
}

export type SpawnChickenEvent = {
  index: number
  position: number[]
}

type Note = {
  time: number
}

export type LoadTrackEvent = {
  id: string
  notes: Note[]
}
