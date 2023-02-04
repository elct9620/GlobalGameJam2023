import * as PIXI from 'pixi.js';
import { TickEvent } from './events'
import { TickEvent as TypeTickEvent } from './types'
import { Subject } from 'rxjs'
import Container from './container'

import './style.css';

const app = new PIXI.Application({
  view: document.getElementById("view") as HTMLCanvasElement,
  resizeTo: window,
  resolution: devicePixelRatio || 1,
  autoDensity: true,
  background: '#000000',
});

app.ticker.add(delta => {
  Container.get<Subject<TickEvent>>(TypeTickEvent).next({ delta })
})
