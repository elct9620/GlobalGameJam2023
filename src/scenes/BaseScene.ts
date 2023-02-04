import * as PIXI from 'pixi.js';
import { injectable } from 'inversify'
import 'reflect-metadata';

@injectable()
export class BaseScene extends PIXI.Container {
  load = () => {
    if(import.meta.env.DEV) {
      console.info('Loaded Scene: ', this.constructor.name)
    }
  }
  unload = () => {}
}
