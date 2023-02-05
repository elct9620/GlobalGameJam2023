import MidiParser from 'midi-parser-js'

export function loadMidi(src: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fetch(src).then(r => r.arrayBuffer()).then(midiData => {
      resolve(MidiParser.Uint8(new Uint8Array(midiData)));
    }).catch(reject);
  });
}

interface Note {
  time: number, data: number[],
}
const INIT_MIDI_STATE = { notes: [], accTime: -400 }
export function encodeMidi(midi: any, speed: number) {
  return midi.track[0].event.reduce((
    { notes, accTime }: { notes: Note[], accTime: number }, event: any
  ) => {
    if (event.type === 9 && event.data?.[1] === 80) {
      const newAccTime = accTime + event.deltaTime / (midi.timeDivision * speed) * 1000 + 400;
      const note = { time: newAccTime, data: event.data };

      return { notes: [...notes, note], accTime: newAccTime };
    }

    return { notes, accTime }
  }, INIT_MIDI_STATE)
}

export async function encodeMidiFrom(src: string, speed: number) {
  return encodeMidi(await loadMidi(src), speed)
}
