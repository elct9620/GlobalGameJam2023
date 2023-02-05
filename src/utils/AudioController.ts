import { loadAudioBuffer } from './Audio'

export class AudioController {
  private readonly context: AudioContext
  private buffers: AudioBuffer[] = []

  constructor(context?: AudioContext) {
    console.log(context)
    this.context = context || new AudioContext()
  }

  async add(...sources: string[]) {
    for(let source of sources) {
      this.buffers.push(await loadAudioBuffer(source, this.context))
    }
  }

  play(index?: number) {
    const source = this.context.createBufferSource();
    source.connect(this.context.destination)
    source.buffer = this.buffers[index || this.sample()];
    source.start()
  }

  private sample(): number {
    return Math.floor(this.buffers.length * Math.random())
  }
}
