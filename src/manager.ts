import { injectable } from 'inversify'
import * as PIXI from 'pixi.js'
import 'reflect-metadata';
import Container from './container'

export interface IScene extends PIXI.Container {
  load(): void
  unload(): void
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

  to(id: string) {
    const nextScene = this.scenes[id]
    if(!nextScene) { return; }

    const scene = Container.resolve<IScene>(nextScene)
    if(this.currentScene) {
      this.app.stage.removeChild(this.currentScene)
      this.currentScene.unload()
    }

    scene.load()
    this.app.stage.addChild(scene)
    this.currentScene = scene
  }
}
