import { beforeEach, describe, expect, it } from 'vitest'

import { Game } from '../../src/entities'
import { SeekService } from '../../src/services'

interface SeekServiceContext {
  game: Game
}

beforeEach<SeekServiceContext>(async (ctx) => {
  const notes = [0, 200, 700, 1300]

  ctx.game = new Game('DUMMY')
  ctx.game.setTrack('Music.mid')
  ctx.game.start()
  notes.forEach(time => ctx.game.spawn(time))
})

describe('findSeektedEnemy', () => {
  it<SeekServiceContext>('is expected to find 0', (ctx) => {
    const service = new SeekService(ctx.game, 500)
    expect(service.findSeekIndex(0)).toBe(0)
  })

  describe('when currentTime is 500', () => {
    it<SeekServiceContext>('is expected to find 0', (ctx) => {
      const service = new SeekService(ctx.game, 500)
      expect(service.findSeekIndex(500)).toBe(0)
    })
  })

  describe('when currentTime is 700', () => {
    it<SeekServiceContext>('is expected to find 0', (ctx) => {
      const service = new SeekService(ctx.game, 500)
      expect(service.findSeekIndex(700)).toBe(1)
    })
  })

  describe('when currentTime is 1300', () => {
    it<SeekServiceContext>('is expected to find 0', (ctx) => {
      const service = new SeekService(ctx.game, 500)
      expect(service.findSeekIndex(1300)).toBe(3)
    })
  })
})
