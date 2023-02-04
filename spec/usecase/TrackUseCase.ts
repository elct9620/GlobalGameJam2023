import { beforeEach, describe, expect, it } from 'vitest'

import { TrackUseCase } from '../../src/usecase'
import Container from '../../src/container'

interface TrackUseCaseContext {
  usecase: TrackUseCase
}

beforeEach<TrackUseCaseContext>(async (ctx) => {
  ctx.usecase = Container.resolve<TrackUseCase>(TrackUseCase)
})

describe('load', () => {
  it<TrackUseCaseContext>('is expected to be Music.mid', (ctx) => {
    expect(ctx.usecase.Load('Music.mid', [])).toBe('Music.mid')
  })
})
