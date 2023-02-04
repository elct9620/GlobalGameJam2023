import { Track } from '../entities'

export interface ITrackRepository {
  Find(id: string): Track
  FindOrCreate(id: string): Track
  UpdateNotes(track: Track): void
}
