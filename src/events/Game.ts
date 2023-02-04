export type GameCreatedEvent = {
  id: string
}

export type GameStartedEvent = {
  id: string
}

export type GameHitEvent = {
  id: string
}

type Note = {
  time: number
}

export type LoadTrackEvent = {
  id: string
  notes: Note[]
}
