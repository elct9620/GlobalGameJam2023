import { Track } from '../entities'

export interface ITrackRepository {
  FindOrCreate(id: string): Track
  UpdateNotes(track: Track): void
}
