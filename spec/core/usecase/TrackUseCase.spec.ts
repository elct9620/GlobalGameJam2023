import { beforeEach, describe, expect, it } from 'vitest'

import { TrackUseCase } from '@/core/usecase'
import Container from '@/container'

interface TrackUseCaseContext {
  usecase: TrackUseCase
}

beforeEach<TrackUseCaseContext>(async (ctx) => {
  ctx.usecase = Container.resolve<TrackUseCase>(TrackUseCase)
})

describe('load', () => {
  it<TrackUseCaseContext>('is expected to have id Music.mid', (ctx) => {
    expect(ctx.usecase.Load('Music.mid', [])).toHaveProperty('id', 'Music.mid')
  })

  it<TrackUseCaseContext>('is expected to have loadedCount is 1', (ctx) => {
    expect(ctx.usecase.Load('Music.mid', [{ time: 0 }])).toHaveProperty('loadedCount', 1)
  })
})
