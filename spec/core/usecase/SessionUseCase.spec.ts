import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { PlayerID } from '../../../src/core/types'
import { SessionUseCase } from '../../../src/core/usecase'
import Container from '../../../src/container'

interface SessionUseCaseContext {
  usecase: SessionUseCase
}

beforeAll(() => {
  Container.bind<string>(PlayerID).toConstantValue('__LOCAL_PLAYER__')
})

beforeEach<SessionUseCaseContext>(async (ctx) => {
  ctx.usecase = Container.resolve<SessionUseCase>(SessionUseCase)
})

describe('get current game ID', () => {
  it<SessionUseCaseContext>('is expected to throw error', (ctx) => {
    expect(() => ctx.usecase.CurrentGameID()).toThrowError('player not found')
  })

  describe('when player initialized', () => {
    it<SessionUseCaseContext>('is expected to be undefined', (ctx) => {
      ctx.usecase.Start()

      expect(ctx.usecase.CurrentGameID()).toBeUndefined()
    })
  })
})
