import * as PIXI from 'pixi.js'

const animateFrames = import.meta.glob('@/assets/chickenHit/*.png', { eager: true, as: 'url' })

export class HittedChicken extends PIXI.AnimatedSprite {
  static readonly assets: string[] = Object.values(animateFrames)
  static readonly animationSpeed = 0.15
  static readonly scale: PIXI.Point = new PIXI.Point(0.5, 0.5)

  constructor(x: number, y: number) {
    super(HittedChicken.assets.map(path => PIXI.Texture.from(path)))

    this.scale.set(HittedChicken.scale.x, HittedChicken.scale.y)
    this.position.set(x, y)
    this.animationSpeed = HittedChicken.animationSpeed;
  }
}
