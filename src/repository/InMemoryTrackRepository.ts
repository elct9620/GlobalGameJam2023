import { injectable } from 'inversify'
import 'reflect-metadata';

import { ITrackRepository } from './ITrackRepository'
import { Track } from '../entities'

type TrackCollection = { [key: string]: Track }

@injectable()
export class InMemoryTrackRepository implements ITrackRepository {
  private collection: TrackCollection = {}

  FindOrCreate(id: string): Track {
    if(this.collection[id]) {
      return this.collection[id]
    }

    const track = new Track(id)
    this.collection[id] = track
    return this.collection[id]
  }

  UpdateNotes(_track: Track) {
  }
}
