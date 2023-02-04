import * as PIXI from 'pixi.js';
import { injectable } from 'inversify'
import 'reflect-metadata';

@injectable()
export class BaseScene extends PIXI.Container {
  constructor() {
    super()

    this.onCreated()
  }

  onCreated = () => {}
  onLoaded = () => {}
  onUnloaded = () => {}

  load = () => {
    if(import.meta.env.DEV) {
      console.info('Loaded Scene: ', this.constructor.name)
    }

    this.onLoaded()
  }
  unload = () => this.onUnloaded()
}
