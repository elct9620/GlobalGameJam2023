import { beforeEach, describe, expect, it } from 'vitest'

import { Game } from '@/core/entities'
import { HitService } from '@/core/services'

interface HitServiceContext {
  game: Game
}

beforeEach<HitServiceContext>(async (ctx) => {
  const notes = [0, 200, 700, 1300]

  ctx.game = new Game('DUMMY')
  ctx.game.setTrack('Music.mid')
  ctx.game.start()
  notes.forEach(time => ctx.game.spawn(time))
})

describe('findHittedEnemy', () => {
  it<HitServiceContext>('is expected to find 0', (ctx) => {
    const service = new HitService(ctx.game, 500, 500)
    expect(service.findHittedEnemy(0)).toBe(0)
  })

  describe('when seek to 200', () => {
    it<HitServiceContext>('is expected to find 0', (ctx) => {
      const service = new HitService(ctx.game, 500, 500)
      expect(service.findHittedEnemy(200)).toBe(0)
    })
  })

  describe('when seek to 200 and index 0 is captured', () => {
    it<HitServiceContext>('is expected to find 1', (ctx) => {
      ctx.game.capture(0)
      const service = new HitService(ctx.game, 500, 500)
      expect(service.findHittedEnemy(200)).toBe(1)
    })
  })

  describe('when seek to 600', () => {
    it<HitServiceContext>('is expected to find 1', (ctx) => {
      const service = new HitService(ctx.game, 500, 500)
      expect(service.findHittedEnemy(600)).toBe(1)
    })
  })

  describe('when seek to 600 and index 1 is captured', () => {
    it<HitServiceContext>('is expected to find 2', (ctx) => {
      ctx.game.capture(1)
      const service = new HitService(ctx.game, 500, 500)
      expect(service.findHittedEnemy(600)).toBe(2)
    })
  })

  describe('when seek to 1200', () => {
    it<HitServiceContext>('is expected to find 2', (ctx) => {
      const service = new HitService(ctx.game, 500, 500)
      expect(service.findHittedEnemy(1200)).toBe(2)
    })
  })

  describe('when seek to 1300', () => {
    it<HitServiceContext>('is expected to find 3', (ctx) => {
      const service = new HitService(ctx.game, 500, 500)
      expect(service.findHittedEnemy(1300)).toBe(3)
    })
  })

  describe('when no notes on time', () => {
    it<HitServiceContext>('is expected to find -1', (ctx) => {
      ctx.game = new Game('DUMMY')
      ctx.game.setTrack('Music.mid')
      ctx.game.start()
      ctx.game.spawn(1300)

      const service = new HitService(ctx.game, 500, 500)
      expect(service.findHittedEnemy()).toBe(-1)
    })
  })
})
