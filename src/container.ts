import { Container } from 'inversify'
import { Subject } from 'rxjs'
import * as events from './events'
import * as types from './types'
import 'reflect-metadata'

const container = new Container()

container.bind<Subject<events.TickEvent>>(types.TickEvent).toConstantValue(new Subject<events.TickEvent>())

export default container
