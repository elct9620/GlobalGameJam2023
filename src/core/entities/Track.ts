import { Note } from './Note'

type NoteData = {
  time: number
}

export class Track {
  public readonly ID: string
  private _notes: Note[] = []

  constructor(id: string) {
    this.ID = id
  }

  get notesCount(): number {
    return this._notes.length
  }

  get notes(): Note[] {
    return [...this._notes]
  }

  resetNote() {
    this._notes = []
  }

  addNote(note: NoteData) {
    this._notes.push(new Note(note.time))
  }
}
