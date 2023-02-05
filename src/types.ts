// Constant
export const PlayerID = Symbol('PlayerID')

// Event
export const GameCreatedEvent = Symbol('GameCreatedEvent')
export const GameStartedEvent = Symbol('GameStartedEvent')
export const GameEndedEvent = Symbol('GameEndedEvent')
export const GameHitEvent = Symbol('GameHitEvent')
export const GameHittedEvent = Symbol('GameHittedEvent')
export const GameMissedEvent = Symbol('GameMissedEvent')

export const SeekEvent = Symbol('SeekEvent')
export const SpawnChickenEvent = Symbol('SpawnChickenEvent')

export const LoadTrackEvent = Symbol('LoadTrackEvent')

export const KeyboardEvent = Symbol('KeyboardEvent')

// Repository
export const IGameRepository = Symbol('IGameRepository')
export const IPlayerRepository = Symbol('IPlayerRepository')
export const ITrackRepository = Symbol('ITrackRepository')
