import * as PIXI from 'pixi.js'

const normalFrames: { [key: string]: string } = import.meta.glob('@/assets/potatoNormal/*.png', { eager: true, as: 'url' })
const castFrames: { [key: string]: string } = import.meta.glob('@/assets/potatoCast/*.png', { eager: true, as: 'url' })

export class Potato extends PIXI.Container {
  static readonly CAST_COOL_DOWN = 350;

  static readonly assets: string[] = Object.values(normalFrames).concat(Object.values(castFrames))
  static readonly animationSpeed = 0.3
  static readonly scale: PIXI.Point = new PIXI.Point(0.5, 0.5)

  private readonly animations: PIXI.AnimatedSprite[]
  protected _casting: boolean = false

  constructor(x: number, y: number) {
    super()

    this.animations = [
      PIXI.AnimatedSprite.fromImages(Object.values(normalFrames)),
      PIXI.AnimatedSprite.fromImages(Object.values(castFrames)),
    ]

    this.position.set(x, y)

    this.animations.forEach(anim => {
      anim.animationSpeed = Potato.animationSpeed
      anim.loop = true
      anim.play()
      anim.anchor.set(0.5, 0.5)
      anim.scale.set(0.5, 0.5)

      this.addChild(anim)
    })

    this.animations[1].scale.set(0.56, 0.56)
  }

  cast() {
    if(this._casting) return;

    this._casting = true
    setTimeout(() => this._casting = false, Potato.CAST_COOL_DOWN)
  }

  protected _render(_renderer: PIXI.Renderer): void {
    this.animations.forEach((anim, index) => {
      anim.visible = !!index == this._casting
    })
  }
}
