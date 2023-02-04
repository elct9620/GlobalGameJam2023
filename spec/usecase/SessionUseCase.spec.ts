import { beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { PlayerID } from '../../src/types'
import { SessionUseCase, PlayerUseCase } from '../../src/usecase'
import Container from '../../src/container'

interface SessionUseCaseContext {
  usecase: SessionUseCase
}

beforeAll(() => {
  Container.bind<string>(PlayerID).toConstantValue('__LOCAL_PLAYER__')
})

beforeEach<SessionUseCaseContext>(async (ctx) => {
  ctx.usecase = Container.resolve<SessionUseCase>(SessionUseCase)
})

describe('get current player ID', () => {
  it<SessionUseCaseContext>('is expected to be __LOCAL_PLAYER__', (ctx) => {
    expect(() => ctx.usecase.CurrentPlayerID()).toThrowError('player not found')
  })

  describe('when player initialized', () => {
    it<SessionUseCaseContext>('is expected to be __LOCAL_PLAYER__', (ctx) => {
      Container.resolve<PlayerUseCase>(PlayerUseCase).Init()

      expect(ctx.usecase.CurrentPlayerID()).toBe('__LOCAL_PLAYER__')
    })
  })
})
