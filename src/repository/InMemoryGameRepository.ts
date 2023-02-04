import { injectable } from 'inversify'
import 'reflect-metadata';

import { IGameRepository } from './IGameRepository'

@injectable()
export class InMemoryGameRepository implements IGameRepository {
}
