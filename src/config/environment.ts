import * as PIXI from 'pixi.js';
import { Subject } from 'rxjs'

import Manager from '../manager'
import Container from '../container'
import { PlayerUseCase } from '../usecase'
import { TickEvent } from '../events'
import { TickEvent as TypeTickEvent, PlayerID } from '../types'

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

const usecase = Container.resolve<PlayerUseCase>(PlayerUseCase)
const playerID = usecase.Init()
Container.bind<string>(PlayerID).toConstantValue(playerID)
