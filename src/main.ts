import * as PIXI from 'pixi.js';
import MidiParser from 'midi-parser-js';

import chickenSpritesheetJson from './assets/test/chicken.json';
import chickenSpritesheetPng from './assets/test/chicken.png';
import testTrackOgg from './assets/test/track.ogg';
import testTrackMid from './assets/test/track.mid';

import './style.css';

const app = new PIXI.Application({
  resizeTo: window,
  resolution: devicePixelRatio,
  background: '#FFFFFF',
});
document.body.appendChild(app.view as unknown as Node);

const chickenSpriteSheet = new PIXI.Spritesheet(
  PIXI.BaseTexture.from(chickenSpritesheetPng),
  chickenSpritesheetJson,
);
await chickenSpriteSheet.parse();

const chicken = new PIXI.AnimatedSprite(
  chickenSpriteSheet.animations.chicken
);
chicken.x = app.screen.width / 2;
chicken.y = app.screen.height / 2;
chicken.scale.set(2, 2);
chicken.anchor.set(0.5);
chicken.animationSpeed = 0.1;
chicken.play();

app.stage.addChild(chicken);

// audio
const audioContext = new AudioContext();
const source = audioContext.createBufferSource();
source.buffer = await loadAudioBuffer(testTrackOgg, audioContext);
source.connect(audioContext.destination);

// midi
const midi = await loadMidi(testTrackMid);
const trackEvents = midi.track[1].event.filter(e => Array.isArray(e.data));
console.log({ midi, trackEvents });

let startTime: number | null = null;
let lastEventTime = 0;
document.body.addEventListener('keydown', () => {
  if (startTime === null) {
    startTime = Date.now();
    source.start();
    console.log('started');
    return;
  }
});

// Animate the rotation
app.ticker.add(() => {
  chicken.rotation += 0.01;

  if (startTime !== null && trackEvents.length > 0) {
    const timeAt = Date.now() - startTime;
    const afterLastEvent = timeAt - lastEventTime;
    if (afterLastEvent > trackEvents[0].deltaTime) {
      console.log(trackEvents.shift());
      lastEventTime = timeAt;
    }
  }
});

// helpers
function loadAudioBuffer(src: string, audioContext: AudioContext): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    fetch(src).then(r => r.arrayBuffer()).then(audioData => {
      audioContext.decodeAudioData(audioData, resolve, reject);
    }).catch(reject);
  });
}

function loadMidi(src: string): Promise<any> {
  return new Promise((resolve, reject) => {
    fetch(src).then(r => r.arrayBuffer()).then(midiData => {
      resolve(MidiParser.Uint8(new Uint8Array(midiData)));
    }).catch(reject);
  });
}
