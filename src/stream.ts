import {
  Subject,
  Observer as RxObserver,
  Subscription,
  filter,
  map
} from 'rxjs'

export interface DomainEvent<T> {
  type: symbol
  payload: T
}

const stream$: Subject<DomainEvent<any>> = new Subject<DomainEvent<any>>()

export function publish<T>(type: symbol, payload: T) { return stream$.next({ type, payload }) }

export type Observer<T> = Partial<RxObserver<T>> | ((payload: T) => void)
export function subscribe<T>(type: symbol, observer: Observer<T>): Subscription {
  return stream$
    .pipe(
      filter((event: DomainEvent<any>) => event.type == type),
      map<DomainEvent<any>, T>(event => event.payload as T),
    )
    .subscribe(observer)
}
