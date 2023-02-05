import { publish, subscribe, Observer } from '../stream'

export const KeyboardEvent = Symbol('KeyboardEvent')
export type KeyboardPayload = {
  pressed: boolean
  key: string
  code: number
}

export const emitInput = (payload: KeyboardPayload) => publish(KeyboardEvent, payload)
export const onInput = (observer: Observer<KeyboardPayload>) => subscribe<KeyboardPayload>(KeyboardEvent, observer)
