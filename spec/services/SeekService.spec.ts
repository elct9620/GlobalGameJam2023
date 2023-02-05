import { beforeEach, describe, expect, it } from 'vitest'

import { Game } from '../../src/entities'
import { SeekService } from '../../src/services'

interface SeekServiceContext {
  game: Game
}

beforeEach<SeekServiceContext>(async (ctx) => {
  const notes = [0, 200, 1000, 2300]

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

  describe('when currentTime is 100', () => {
    it<SeekServiceContext>('is expected to find 2', (ctx) => {
      const service = new SeekService(ctx.game, 500)
      expect(service.findSeekIndex(1000)).toBe(2)
    })
  })

  describe('when currentTime is 2300', () => {
    it<SeekServiceContext>('is expected to find 3', (ctx) => {
      const service = new SeekService(ctx.game, 500)
      expect(service.findSeekIndex(2300)).toBe(3)
    })
  })
})
