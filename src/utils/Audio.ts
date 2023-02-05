export function loadAudioBuffer(src: string, audioContext: AudioContext): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    fetch(src).then(r => r.arrayBuffer()).then(audioData => {
      audioContext.decodeAudioData(audioData, resolve, reject);
    }).catch(reject);
  });
}
