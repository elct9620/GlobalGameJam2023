import { beforeEach, describe, expect, it } from 'vitest'

import { GameUseCase } from '../../src/usecase'
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
  it<GameUseCaseContext>('is expected to be 1', (ctx) => {
    const id = ctx.usecase.CreateGame()
    expect(ctx.usecase.ElapseGameTime(id, 1)).toBe(1)
  })

  describe('when game not exists', () => {
    it<GameUseCaseContext>('is expected to be -1', (ctx) => {
      expect(ctx.usecase.ElapseGameTime('__UNKNOWN__', 1)).toBe(-1)
    })
  })
})

describe('hit', () => {
  it<GameUseCaseContext>('is expected to have type started', (ctx) => {
    expect(ctx.usecase.Hit()).toHaveProperty('type', 'started')
  })
})
