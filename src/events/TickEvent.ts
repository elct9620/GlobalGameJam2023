import { publish, subscribe, Observer } from '../stream'

export const TickEvent = Symbol('Core::TickEvent')
export type TickPayload = {
  delta: number
  deltaMS: number
}

export const emitTick = (payload: TickPayload) => publish(TickEvent, payload)
export const onTick = (observer: Observer<TickPayload>) => subscribe<TickPayload>(TickEvent, observer)
