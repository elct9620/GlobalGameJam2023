import * as PIXI from 'pixi.js';
import { injectable } from 'inversify'
import 'reflect-metadata';

@injectable()
export class BaseScene extends PIXI.Container {
  readonly assets: (string | PIXI.LoadAsset<any>)[] = []

  constructor() {
    super()
  }

  onUpdate = (_delta: number) => {}
  onCreated = () => {}
  onPreLoad = async () => {}
  onLoaded = () => {}
  onDestroyed = () => {}
}
