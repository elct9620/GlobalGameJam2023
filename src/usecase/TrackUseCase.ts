import { injectable } from 'inversify'
import 'reflect-metadata';

type Note = {
  time: number
}

@injectable()
export class TrackUseCase {
  Load(id: string, _notes: Note[]): string {
    return id
  }
}
