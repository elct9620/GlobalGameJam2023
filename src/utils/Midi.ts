import { Midi } from '@tonejs/midi'

export function loadMidi(src: string): Promise<Midi> {
  return Midi.fromUrl(src);
}

interface Note {
  time: number, data: any,
}
export function encodeMidi(midi: Midi): { notes: Note[] } {
  return {
    notes: midi.tracks[0].notes.map(n => ({ time: n.time * 1000, data: n }))
  };
}

export async function encodeMidiFrom(src: string) {
  return encodeMidi(await loadMidi(src))
}
