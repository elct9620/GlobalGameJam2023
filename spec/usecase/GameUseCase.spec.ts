import { beforeEach, describe, expect, it } from 'vitest'

import { GameUseCase, TrackUseCase } from '../../src/usecase'
import Container from '../../src/container'

interface GameUseCaseContext {
  usecase: GameUseCase
}

beforeEach<GameUseCaseContext>(async (ctx) => {
  ctx.usecase = Container.resolve<GameUseCase>(GameUseCase)
})

describe('create game', () => {
  it<GameUseCaseContext>('is expected to be truthy', (ctx) => {
    expect(ctx.usecase.CreateGame()).toBeTruthy()
  })
})

describe('elapse game time', () => {
  it<GameUseCaseContext>('is expected to be -1', (ctx) => {
    const id = ctx.usecase.CreateGame()
    expect(ctx.usecase.ElapseGameTime(id, 1)).toBe(-1)
  })

  describe('when game not exists', () => {
    it<GameUseCaseContext>('is expected to be -1', (ctx) => {
      expect(() => ctx.usecase.ElapseGameTime('__UNKNOWN__', 1)).toThrowError('game not found')
    })
  })

  describe('when game started', () => {
    it<GameUseCaseContext>('is expected to be 1', (ctx) => {
      const id = ctx.usecase.CreateGame()
      ctx.usecase.SetTrack(id, 'Music.mid')
      ctx.usecase.Hit(id)
      expect(ctx.usecase.ElapseGameTime(id, 1)).toBe(1)
    })
  })
})

describe('seek time', () => {
  it<GameUseCaseContext>('is expected to have time 0', (ctx) => {
    const id = ctx.usecase.CreateGame()
    expect(ctx.usecase.SyncSeek(id, 1)).toHaveProperty('time', 0)
  })

  it<GameUseCaseContext>('is expected to have index -1', (ctx) => {
    const id = ctx.usecase.CreateGame()
    expect(ctx.usecase.SyncSeek(id, 1)).toHaveProperty('index', -1)
  })

  describe('when game started', () => {
    it<GameUseCaseContext>('is expected to have time 1', (ctx) => {
      const id = ctx.usecase.CreateGame()
      ctx.usecase.SetTrack(id, 'Music.mid')
      ctx.usecase.Hit(id)
      expect(ctx.usecase.SyncSeek(id, 1)).toHaveProperty('time', 1)
    })
  })

  describe('when index is changed', () => {
    it<GameUseCaseContext>('is expected to have index 1', (ctx) => {
      const track = Container.resolve<TrackUseCase>(TrackUseCase)
      track.Load('Music.mid', [{ time: 2500 }, { time: 4000}])

      const id = ctx.usecase.CreateGame()
      ctx.usecase.SetTrack(id, 'Music.mid')
      ctx.usecase.Hit(id)
      ctx.usecase.SpawnChicken(id)

      expect(ctx.usecase.SyncSeek(id, 5000)).toHaveProperty('index', 1)
    })
  })
})

describe('set track', () => {
  it<GameUseCaseContext>('is expected to be Music1.mid', (ctx) => {
    const id = ctx.usecase.CreateGame()
    expect(ctx.usecase.SetTrack(id, 'Music1.mid')).toBe('Music1.mid')
  })
})

describe('hit', () => {
  it<GameUseCaseContext>('is expected to have type started', (ctx) => {
    const id = ctx.usecase.CreateGame()
    ctx.usecase.SetTrack(id, 'Music.mid')
    expect(ctx.usecase.Hit(id)).toHaveProperty('type', 'started')
  })

  describe('when game is started without track', () => {
    it<GameUseCaseContext>('is expected to have type action', (ctx) => {
      const id = ctx.usecase.CreateGame()
      ctx.usecase.SetTrack(id, 'Music.mid')
      ctx.usecase.Hit(id)

      expect(ctx.usecase.Hit(id)).toHaveProperty('type', 'action')
    })

    it<GameUseCaseContext>('is expected to have meta index -1', (ctx) => {
      const id = ctx.usecase.CreateGame()
      ctx.usecase.SetTrack(id, 'Music.mid')
      ctx.usecase.Hit(id)

      expect(ctx.usecase.Hit(id)).toHaveProperty('meta', { index: -1})
    })
  })

  describe('when game is started with track and hitted', () => {
    it<GameUseCaseContext>('is expected to have meta index 0', (ctx) => {
      const track = Container.resolve<TrackUseCase>(TrackUseCase)
      track.Load('Music.mid', [{ time: 0 }])

      const id = ctx.usecase.CreateGame()
      ctx.usecase.SetTrack(id, 'Music.mid')
      ctx.usecase.Hit(id)
      ctx.usecase.SpawnChicken(id)

      expect(ctx.usecase.Hit(id)).toHaveProperty('meta', { index: 0 })
    })
  })

  describe('when game is started with track and not hitted', () => {
    it<GameUseCaseContext>('is expected to have meta index -1', (ctx) => {
      const track = Container.resolve<TrackUseCase>(TrackUseCase)
      track.Load('Music.mid', [{ time: 1000 }])

      const id = ctx.usecase.CreateGame()
      ctx.usecase.SetTrack(id, 'Music.mid')
      ctx.usecase.Hit(id)

      expect(ctx.usecase.Hit(id)).toHaveProperty('meta', { index: -1 })
    })
  })
})

describe('spawn', () => {
  it<GameUseCaseContext>('is expected to be 0', (ctx) => {
    const track = Container.resolve<TrackUseCase>(TrackUseCase)
    track.Load('Music.mid', [])

    const id = ctx.usecase.CreateGame()
    ctx.usecase.SetTrack(id, 'Music.mid')
    ctx.usecase.Hit(id)

    expect(ctx.usecase.SpawnChicken(id)).toBe(0)
  })

  describe('when track has note', () => {
    it<GameUseCaseContext>('is expected to be 2', (ctx) => {
      const track = Container.resolve<TrackUseCase>(TrackUseCase)
      track.Load('Music.mid', [{ time: 0 }, { time: 100 }])

      const id = ctx.usecase.CreateGame()
      ctx.usecase.SetTrack(id, 'Music.mid')
      ctx.usecase.Hit(id)

      expect(ctx.usecase.SpawnChicken(id)).toBe(2)
    })
  })
})
