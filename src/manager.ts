import { injectable } from 'inversify'
import * as PIXI from 'pixi.js'
import 'reflect-metadata';
import Container from './container'

export interface IScene extends PIXI.Container {
  readonly assets: string[]

  onLoaded(): void
  onCreated(): void
  onDestroyed(): void
}

interface SceneConstructor {
  new(): IScene
}

type SceneCollection = { [key: string]: SceneConstructor }

@injectable()
export default class Manager {
  private scenes: SceneCollection  = {}
  private currentScene?: IScene;

  readonly app: PIXI.Application

  constructor(app: PIXI.Application) {
    this.app = app
  }

  register(id: string, scene: SceneConstructor) {
    if (this.scenes[id] && import.meta.env.DEV) {
      console.warn('Scene alread added:', id)
    }

    this.scenes[id] = scene
  }

  async to(id: string) {
    const nextScene = this.scenes[id]
    if(!nextScene) { return; }

    const scene = Container.resolve<IScene>(nextScene)
    scene.onCreated()

    if(this.currentScene) {
      this.app.stage.removeChild(this.currentScene)
      this.currentScene.onDestroyed()
    }

    await PIXI.Assets.backgroundLoad(scene.assets)

    this.app.stage.addChild(scene)
    this.currentScene = scene
    this.currentScene.onLoaded()

    if(import.meta.env.DEV) {
      console.info('Loaded Scene:', this.currentScene.constructor.name)
    }
  }
}
