import { inject, injectable } from 'inversify'
import 'reflect-metadata';

import type { ITrackRepository } from '../../src/repository'
import * as types from '../types'

type Note = {
  time: number
}

@injectable()
export class TrackUseCase {
  private readonly repo: ITrackRepository

  constructor(
    @inject(types.ITrackRepository) repo: ITrackRepository
  ) {
    this.repo = repo
  }

  Load(id: string, notes: Note[]): string {
    const track = this.repo.FindOrCreate(id)
    track.resetNote()

    for(let note in notes) {
      track.addNote(note)
    }

    this.repo.UpdateNotes(track)
    return id
  }
}
