import { inject, injectable } from 'inversify'
import { Subject, Subscription } from 'rxjs'
import * as PIXI from 'pixi.js'
import MidiParser from 'midi-parser-js'
import 'reflect-metadata'
import gsap from 'gsap'

import { BaseScene } from './BaseScene'
import { GameUseCase } from '../usecase'
import {
  GameStartedEvent,
  GameHitEvent,
  SpawnChickenEvent,
  LoadTrackEvent,
} from '../events'
import {
  GameStartedEvent as GameStartedEventType,
  GameHitEvent as GameHitEventType,
  SpawnChickenEvent as SpawnChickenEventType,
  LoadTrackEvent as LoadTrackEventType,
} from '../types'

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
import rootImg0 from '@/assets/root/0.png';
import rootImg1 from '@/assets/root/1.png';
import rootImg2 from '@/assets/root/2.png';
import chickenHitImg0 from '@/assets/chickenHit/0.png';
import chickenHitImg1 from '@/assets/chickenHit/1.png';
import houseImg from '@/assets/house.png';

interface Note {
  time: number, data: number[],
  chicken?: PIXI.AnimatedSprite,
  hitTime?: number,
  chickenHit?: PIXI.AnimatedSprite,
  miss?: boolean,
}

/**
 * base 1 second for 100px on screen,
 * TRACK_SCALE = 2 => 1 second for 200px
 */
const TRACK_SCALE = 4;

const NOTE_BEFORE = 500;
const NOTE_AFTER = 500;
const ENDED_SLOW_DOWN_DURATION = 5000;

@injectable()
export class GameScene extends BaseScene {
  readonly assets: string[] = [
    bgImg, groundImg,
    cloud1Img, cloud2Img, cloud3Img,
    chickenImg0, chickenImg1, chickenImg2,
    rootImg0, rootImg1, rootImg2,
    chickenHitImg0, chickenHitImg1,
    houseImg,
  ]

  private bg?: PIXI.TilingSprite;
  private ground?: PIXI.TilingSprite;
  private audioContext?: AudioContext;
  private bgm?: AudioBufferSourceNode;
  private currentNoteIndex: number = 0;
  private notes?: Note[];
  private chickenContainer?: PIXI.Container;
  private house?: PIXI.Sprite;
  private root?: PIXI.AnimatedSprite;
  private started: boolean = false;
  private endedTime?: number;
  private score = 0;
  private missed = 0;

  private _chickenTextures: PIXI.Texture[] = []
  private _chickens: PIXI.AnimatedSprite[] = []

  private _onGameStarted?: Subscription
  private _onGameHit?: Subscription
  private _onSpawnChicken?: Subscription

  private readonly usecase: GameUseCase;
  private readonly evtGameStarted: Subject<GameStartedEvent>
  private readonly evtGameHit: Subject<GameHitEvent>
  private readonly evtSpawnChicken: Subject<SpawnChickenEvent>
  private readonly evtLoadTrack: Subject<LoadTrackEvent>

  constructor(
    @inject(GameUseCase) usecase: GameUseCase,
    @inject(GameStartedEventType) evtGameStarted: Subject<GameStartedEvent>,
    @inject(GameHitEventType) evtGameHit: Subject<GameHitEvent>,
    @inject(SpawnChickenEventType) evtSpawnChicken: Subject<SpawnChickenEvent>,
    @inject(LoadTrackEventType) evtLoadTrack: Subject<LoadTrackEvent>,
  ) {
    super()
    this.usecase = usecase
    this.evtGameStarted = evtGameStarted
    this.evtGameHit = evtGameHit
    this.evtSpawnChicken = evtSpawnChicken
    this.evtLoadTrack = evtLoadTrack
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
    this.evtLoadTrack.next({ id: notesMidi, notes: notes })
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
    this.chickenContainer.position.set(200, 260);
    this.addChild(this.chickenContainer)

    this._chickenTextures = [
      PIXI.Texture.from(chickenImg0),
      PIXI.Texture.from(chickenImg1),
      PIXI.Texture.from(chickenImg2),
    ]

    this._onSpawnChicken = this.evtSpawnChicken.subscribe(evt => {
      const chicken = this.spawnChicken(evt.position.x, evt.position.y)
      this._chickens[evt.index] = chicken

      if(this.notes) {
        const note = this.notes[evt.index]
        if (note) {
          note.chicken = chicken
        }
      }

      this.chickenContainer?.addChild(chicken)
    })

    this.root = new PIXI.AnimatedSprite([
      PIXI.Texture.from(rootImg0),
      PIXI.Texture.from(rootImg1),
      PIXI.Texture.from(rootImg2),
      PIXI.Texture.from(rootImg2),
      PIXI.Texture.from(rootImg2),
      PIXI.Texture.from(rootImg2),
      PIXI.Texture.from(rootImg2),
      PIXI.Texture.from(rootImg2),
      PIXI.Texture.from(rootImg0),
    ])
    this.root.scale.set(0.5, 0.5)
    this.root.anchor.set(0.5, 0.5);
    this.root.position.set(200, 350);
    this.root.animationSpeed = 0.8;
    this.root.loop = false;
    this.addChild(this.root)

    this._onGameStarted = this.evtGameStarted.subscribe(() => {
      this.started = true
      this.score = 0
      this.missed = 0
      this.currentNoteIndex = 0
      this.bgm?.start()
      console.log('start!')
    })
    this.evtGameHit.subscribe(() => {
      if (!this.root || !this.notes || !this.audioContext) return;

      this.root.gotoAndPlay(0)
      const currentNote = this.notes[this.currentNoteIndex]
      console.log(currentNote);
      const currentTime = this.audioContext!.currentTime * 1000
      if (
	currentNote.hitTime === undefined &&
	currentTime > currentNote.time - NOTE_BEFORE &&
        currentTime < currentNote.time + NOTE_AFTER
      ) {
	console.log('hit!', currentNote)
	currentNote.hitTime = this.audioContext.currentTime * 1000
	this.score++
	  this.nextNote()
	setTimeout(() => {
	  console.log('chickenHit!', currentNote);
	  const chickenHit = new PIXI.AnimatedSprite([
	    PIXI.Texture.from(chickenHitImg0),
	    PIXI.Texture.from(chickenHitImg1),
	  ])
	  chickenHit.scale.set(0.5, 0.5)
	  chickenHit.position.copyFrom(currentNote.chicken!.position)
	  chickenHit.animationSpeed = 0.15;
	  chickenHit.play();
	  currentNote.chicken?.destroy()
	  this.chickenContainer?.addChild(chickenHit)
	  currentNote.chickenHit = chickenHit
	}, 100);
      }
    })
  }

  onUpdate = (delta: number) => {
    if (this.started) {
      const deltaMS = delta * 16.66;
      const slowDown = this.endedTime ? Math.max((ENDED_SLOW_DOWN_DURATION - (Date.now() - this.endedTime)) / ENDED_SLOW_DOWN_DURATION, 0) : 1
      const groundSpeed = delta * 3 * TRACK_SCALE * slowDown;
      if (this.ground) {
	this.ground.tilePosition.x -= groundSpeed;
      }
      if (this.chickenContainer) {
	this.chickenContainer.position.x -= deltaMS * 0.001 * 100 * TRACK_SCALE;
      }
      if (this.house) {
	this.house.position.x -= groundSpeed;
      }

      if (!this.endedTime && this.audioContext && this.notes) {
	const currentNote = this.notes[this.currentNoteIndex]
	const currentTime = this.audioContext.currentTime * 1000

	if (currentNote && currentTime > currentNote.time + NOTE_AFTER && this.currentNoteIndex < this.notes.length) {
	  currentNote.miss = true
	  this.missed++
	  console.log('after!', this.currentNoteIndex, currentNote);
	  this.nextNote()
	}
      }
    }
  }

  nextNote = () => {
    if (this.notes && this.currentNoteIndex < this.notes.length - 1) {
      this.currentNoteIndex++
    } else if (!this.endedTime) {
	console.log('ended', { score: this.score, missed: this.missed })
      this.endedTime = Date.now()
      this.house = new PIXI.Sprite(PIXI.Texture.from(houseImg))
      this.house.position.set(650 * TRACK_SCALE, 100);
      this.addChild(this.house)
    }
  }

  onDestroyed = () => {
    this._onGameStarted?.unsubscribe()
    this._onGameHit?.unsubscribe()
    this._onSpawnChicken?.unsubscribe()
  }

  spawnChicken(x: number, y: number): PIXI.AnimatedSprite {
    const chicken = new PIXI.AnimatedSprite(this._chickenTextures)
    chicken.scale.set(0.5, 0.5)
    chicken.position.set(x, y)
    chicken.animationSpeed = 0.25;
    chicken.play();

    return chicken
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
