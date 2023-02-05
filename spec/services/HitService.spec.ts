import { beforeEach, describe, expect, it } from 'vitest'

import { Game } from '../../src/entities'
import { HitService } from '../../src/services'

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
    ctx.game.seekTo(0)
    const service = new HitService(ctx.game)
    expect(service.findHittedEnemy()).toBe(0)
  })

  describe('when seek to 200', () => {
    it<HitServiceContext>('is expected to find 0', (ctx) => {
      ctx.game.seekTo(200)
      const service = new HitService(ctx.game)
      expect(service.findHittedEnemy()).toBe(0)
    })
  })

  describe('when seek to 200 and index 0 is captured', () => {
    it<HitServiceContext>('is expected to find 1', (ctx) => {
      ctx.game.seekTo(200)
      ctx.game.capture(0)
      const service = new HitService(ctx.game)
      expect(service.findHittedEnemy()).toBe(1)
    })
  })

  describe('when seek to 600', () => {
    it<HitServiceContext>('is expected to find 1', (ctx) => {
      ctx.game.seekTo(600)
      const service = new HitService(ctx.game)
      expect(service.findHittedEnemy()).toBe(1)
    })
  })

  describe('when seek to 600 and index 1 is captured', () => {
    it<HitServiceContext>('is expected to find 2', (ctx) => {
      ctx.game.capture(1)
      ctx.game.seekTo(600)
      const service = new HitService(ctx.game)
      expect(service.findHittedEnemy()).toBe(2)
    })
  })

  describe('when seek to 1200', () => {
    it<HitServiceContext>('is expected to find 2', (ctx) => {
      ctx.game.seekTo(1200)
      const service = new HitService(ctx.game)
      expect(service.findHittedEnemy()).toBe(2)
    })
  })

  describe('when seek to 1300', () => {
    it<HitServiceContext>('is expected to find 3', (ctx) => {
      ctx.game.seekTo(1300)
      const service = new HitService(ctx.game)
      expect(service.findHittedEnemy()).toBe(3)
    })
  })
})
