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
