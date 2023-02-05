import * as PIXI from 'pixi.js'

const animateFrames = import.meta.glob('@/assets/root/*.png', { eager: true, as: 'url' })

export class Root extends PIXI.AnimatedSprite {
  static readonly assets: string[] = Object.values(animateFrames)
  static readonly animationSpeed = 0.8
  static readonly scale: PIXI.Point = new PIXI.Point(0.5, 0.5)
  static readonly anchor: PIXI.Point = new PIXI.Point(0.5, 0.5)

  constructor(x: number, y: number) {
    const textures = Root.assets.map(path => PIXI.Texture.from(path))
    super([
      textures[0], textures[1], textures[2],
      textures[2], textures[2], textures[2],
      textures[2], textures[2], textures[0],
    ])

    this.scale.set(Root.scale.x, Root.scale.y)
    this.anchor.set(Root.anchor.x, Root.anchor.y)
    this.position.set(x, y)
    this.animationSpeed = Root.animationSpeed;
    this.loop = false
  }
}
