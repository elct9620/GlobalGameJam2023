import { Container } from 'inversify'
import { Subject } from 'rxjs'
import 'reflect-metadata'

import * as events from './events'
import * as types from './types'

const container = new Container({ skipBaseClassChecks: true })

// Events
container.bind<Subject<events.TickEvent>>(types.TickEvent).toConstantValue(new Subject<events.TickEvent>())

export default container
