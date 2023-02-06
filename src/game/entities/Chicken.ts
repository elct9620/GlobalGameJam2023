import * as PIXI from 'pixi.js'

const animateFrames = import.meta.glob('@/assets/chicken/*.png', { eager: true, as: 'url' })

export class Chicken extends PIXI.AnimatedSprite {
  static readonly assets: string[] = Object.values(animateFrames)
  static readonly animationSpeed = 0.25
  static readonly scale: PIXI.Point = new PIXI.Point(0.5, 0.5)

  constructor(x: number, y: number) {
    super(Chicken.assets.map(path => PIXI.Texture.from(path)))

    this.scale.set(Chicken.scale.x, Chicken.scale.y)
    this.position.set(x, y)
    this.animationSpeed = Chicken.animationSpeed;
  }
}
