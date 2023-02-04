import { inject, injectable } from 'inversify'
import * as PIXI from 'pixi.js'
import MidiParser from 'midi-parser-js'
import 'reflect-metadata'
import gsap from 'gsap'

import { BaseScene } from './BaseScene'
import { GameUseCase } from '../usecase'

import bgImg from '@/assets/bg.jpg';
import groundImg from '@/assets/ground.png';
import cloud1Img from '@/assets/cloud1.png';
import cloud2Img from '@/assets/cloud2.png';
import cloud3Img from '@/assets/cloud3.png';
import chickenImg0 from '@/assets/chicken/0.png';
import chickenImg1 from '@/assets/chicken/1.png';
import chickenImg2 from '@/assets/chicken/2.png';
import bgmOgg from '@/assets/track1/bgm.ogg';
import notesMidi from '@/assets/track1/notes.mid';

interface Note {
  time: number, data: number[],
  chicken?: PIXI.AnimatedSprite,
}

@injectable()
export class GameScene extends BaseScene {
  readonly assets: string[] = [
    bgImg, groundImg,
    cloud1Img, cloud2Img, cloud3Img,
    chickenImg0, chickenImg1, chickenImg2,
  ]

  private bg?: PIXI.TilingSprite;
  private ground?: PIXI.TilingSprite;
  private audioContext?: AudioContext;
  private bgm?: AudioBufferSourceNode;
  private currentNoteIndex: number = 0;
  private notes?: Note[];
  private chickenContainer?: PIXI.Container;
  private started: boolean = false;

  private readonly usecase: GameUseCase;

  constructor(
    @inject(GameUseCase) usecase: GameUseCase
  ) {
    super()
    this.usecase = usecase
  }

  onCreated = () => {
    this.usecase.CreateGame()
  }

  onPreLoad = async () => {
    this.audioContext = new AudioContext();
    this.bgm = this.audioContext.createBufferSource();
    this.bgm.buffer = await loadAudioBuffer(bgmOgg, this.audioContext);
    this.bgm.connect(this.audioContext.destination);

    const midi = await loadMidi(notesMidi);
    console.log({ midi, notesMidi })
    const MIDI_SPEED = 2.5;
    const { notes } = midi.track[0].event.reduce(({ notes, accTime }: { notes: Note[], accTime: number }, event: any) => {
      if (event.type === 9 && event.data?.[1] === 80) {
        const newAccTime = accTime + event.deltaTime / (midi.timeDivision * MIDI_SPEED) * 1000 + 400;
        const note = { time: newAccTime, data: event.data };
        return { notes: [...notes, note], accTime: newAccTime };
      }
      return { notes, accTime }
    }, { notes: [], accTime: -400 });
    this.notes = notes;
    console.log({ midi, notes });
  }

  onLoaded = () => {
    this.bg = new PIXI.TilingSprite(
      PIXI.Assets.get(bgImg),
      1280,
      720,
    )
    gsap.to(this.bg.tilePosition, {
      y: -500, duration: 5, repeat: 0,
    });
    this.addChild(this.bg)

    this.ground = new PIXI.TilingSprite(
      PIXI.Assets.get(groundImg),
      1280,
      300,
    )
    this.ground.position.y = 420
    this.addChild(this.ground)

    const cloud1 = new PIXI.Sprite(PIXI.Assets.get(cloud1Img))
    cloud1.scale.set(0.2, 0.2)
    cloud1.position.set(40, 50)
    this.addChild(cloud1)

    const cloud2 = new PIXI.Sprite(PIXI.Assets.get(cloud2Img))
    cloud2.scale.set(0.2, 0.2)
    cloud2.position.set(420, 30)
    this.addChild(cloud2)

    const cloud3 = new PIXI.Sprite(PIXI.Assets.get(cloud3Img))
    cloud3.scale.set(0.2, 0.2)
    cloud3.position.set(1100, 70)
    this.addChild(cloud3)

    this.chickenContainer = new PIXI.Container()
    this.notes?.forEach(note => {
      const chicken = new PIXI.AnimatedSprite([
	PIXI.Texture.from(chickenImg0),
	PIXI.Texture.from(chickenImg1),
	PIXI.Texture.from(chickenImg2),
      ])
      chicken.scale.set(0.5, 0.5)
      chicken.position.set(note.time * 0.1, 0)
      chicken.animationSpeed = 0.1;
      chicken.play();
      this.chickenContainer?.addChild(chicken)
    })
    this.chickenContainer.position.y = 260;
    this.addChild(this.chickenContainer)

    document.body.addEventListener('keydown', event => {
      if (event.keyCode === 32) { // space key
	if (!this.started) {
	  this.started = true
	  this.currentNoteIndex = 0
	  this.bgm?.start()
	  console.log('start!')
	}
      }
    })
  }

  onUpdate = (delta: number) => {
    if (this.started) {
      if (this.ground) {
	this.ground.tilePosition.x -= delta * 2;
      }
      if (this.chickenContainer) {
	this.chickenContainer.position.x -= delta * 1;
      }
    }

    if (this.audioContext && this.notes && this.currentNoteIndex < this.notes.length) {
      if (this.audioContext.currentTime * 1000 > this.notes[this.currentNoteIndex].time) {
	console.log(this.notes[this.currentNoteIndex]);
	this.currentNoteIndex++
      }
    }
  }
}

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
