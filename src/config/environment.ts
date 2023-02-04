import * as PIXI from 'pixi.js';
import { Subject } from 'rxjs'

import Manager from '../manager'
import Container from '../container'
import { TickEvent } from '../events'
import { TickEvent as TypeTickEvent } from '../types'

const app = new PIXI.Application({
  view: document.getElementById("view") as HTMLCanvasElement,
  width: 1280,
  height: 720,
  resolution: devicePixelRatio || 1,
  autoDensity: true,
  background: 'transparent',
});
app.stage.cullable = true
app.ticker.add(delta => { Container.get<Subject<TickEvent>>(TypeTickEvent).next({ delta }) })

const manager = new Manager(app)
Container.bind<Manager>(Manager).toConstantValue(manager)
