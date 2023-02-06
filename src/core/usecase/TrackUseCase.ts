import { inject, injectable } from 'inversify'
import 'reflect-metadata';

import type { ITrackRepository } from '../repository'
import * as types from '../types'

type Note = {
  time: number
}

export type NoteLoadResult = {
  id: string
  loadedCount: number
}

@injectable()
export class TrackUseCase {
  private readonly repo: ITrackRepository

  constructor(
    @inject(types.ITrackRepository) repo: ITrackRepository
  ) {
    this.repo = repo
  }

  Load(id: string, notes: Note[]): NoteLoadResult {
    const track = this.repo.FindOrCreate(id)
    track.resetNote()

    for(let note of notes) {
      track.addNote(note)
    }

    this.repo.UpdateNotes(track)
    return { id, loadedCount: track.notesCount }
  }
}
