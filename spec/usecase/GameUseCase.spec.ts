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
})

describe('spawn', () => {
  it<GameUseCaseContext>('is expected to be 0', (ctx) => {
    const track = Container.resolve<TrackUseCase>(TrackUseCase)
    track.Load('Music.mid', [])

    const id = ctx.usecase.CreateGame()
    ctx.usecase.SetTrack(id, 'Music.mid')
    expect(ctx.usecase.SpawnChicken(id)).toBe(0)
  })
})
