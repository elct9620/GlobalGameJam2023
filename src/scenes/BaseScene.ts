import * as PIXI from 'pixi.js';
import { injectable } from 'inversify'
import 'reflect-metadata';

@injectable()
export class BaseScene extends PIXI.Container {
  readonly assets: string[] = []

  constructor() {
    super()
  }

  onUpdate = () => {}
  onCreated = () => {}
  onLoaded = () => {}
  onDestroyed = () => {}
}
