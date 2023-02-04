import { beforeEach, describe, expect, it } from 'vitest'

import { PlayerUseCase } from '../../src/usecase'
import Container from '../../src/container'

interface PlayerUseCaseContext {
  usecase: PlayerUseCase
}

beforeEach<PlayerUseCaseContext>(async (ctx) => {
  ctx.usecase = Container.resolve<PlayerUseCase>(PlayerUseCase)
})

describe('initialize player', () => {
  it<PlayerUseCaseContext>('is expected to be truthy', (ctx) => {
    expect(ctx.usecase.Init()).toBeTruthy()
  })
})
