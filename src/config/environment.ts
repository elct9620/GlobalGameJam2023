import * as PIXI from 'pixi.js';
import { Subject } from 'rxjs'

import Manager from '../manager'
import Container from '../container'
import { SessionUseCase } from '../usecase'
import { emitTick, KeyboardEvent } from '../events'
import { KeyboardEvent as KeyboardEventType, PlayerID } from '../types'

const app = new PIXI.Application({
  view: document.getElementById("view") as HTMLCanvasElement,
  width: 1280,
  height: 720,
  resolution: devicePixelRatio || 1,
  autoDensity: true,
  background: 'transparent',
});
app.stage.cullable = true
app.ticker.add(delta => { emitTick({ delta, deltaMS: app.ticker.deltaMS }) })

const keyboard$ = Container.get<Subject<KeyboardEvent>>(KeyboardEventType)
window.addEventListener('keydown', (evt: globalThis.KeyboardEvent) => {
  keyboard$.next({
    pressed: true,
    key: evt.key,
    code: evt.keyCode
  })
})

window.addEventListener('keyup', (evt: globalThis.KeyboardEvent) => {
  keyboard$.next({
    pressed: false,
    key: evt.key,
    code: evt.keyCode
  })
})

document.getElementById('cast')?.addEventListener('pointerup', () => {
  keyboard$.next({
    pressed: false,
    key: ' ',
    code: 32
  })
})

const manager = new Manager(app)
Container.bind<Manager>(Manager).toConstantValue(manager)

Container.bind<string>(PlayerID).toConstantValue('__LOCAL_PLAYER__')
const usecase = Container.resolve<SessionUseCase>(SessionUseCase)
usecase.Start()
