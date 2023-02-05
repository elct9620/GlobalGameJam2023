import { inject, injectable } from 'inversify'
import { Subject, Subscription } from 'rxjs'
import * as PIXI from 'pixi.js'
import MidiParser from 'midi-parser-js'
import 'reflect-metadata'
import gsap from 'gsap'

import { BaseScene } from './BaseScene'
import {
  Chicken,
  HittedChicken,
  Root,
  Potato,
} from './objects'
import { GameUseCase } from '../usecase'
import {
  GameStartedEvent,
  GameEndedEvent,
  GameHitEvent,
  GameHittedEvent,
  GameMissedEvent,
  SeekEvent,
  SpawnChickenEvent,
  LoadTrackEvent,
} from '../events'
import {
  GameStartedEvent as GameStartedEventType,
  GameEndedEvent as GameEndedEventType,
  GameHitEvent as GameHitEventType,
  GameHittedEvent as GameHittedEventType,
  GameMissedEvent as GameMissedEventType,
  SeekEvent as SeekEventType,
  SpawnChickenEvent as SpawnChickenEventType,
  LoadTrackEvent as LoadTrackEventType,
} from '../types'

import bgImg from '@/assets/bg.jpg';
import groundImg from '@/assets/ground.png';
import cloud1Img from '@/assets/cloud1.png';
import cloud2Img from '@/assets/cloud2.png';
import cloud3Img from '@/assets/cloud3.png';
import houseImg from '@/assets/house.png';

import {
  bgmOgg, notesMidi,

  seChickenHitOgg1, seChickenHitOgg2, seChickenHitOgg3, seChickenHitOgg4,
  seChickenMissOgg1, seChickenMissOgg2,
  seChickenNormalOgg1, seChickenNormalOgg2, seChickenNormalOgg3, seChickenNormalOgg4, seChickenNormalOgg5,
  seUsShowOgg1, seUsShowOgg2, seUsShowOgg3,
} from '@/assets/ogg/'

interface Note {
  time: number, data: number[],
    chicken?: PIXI.AnimatedSprite,
    hitTime?: number,
    chickenHit?: PIXI.AnimatedSprite,
    miss?: boolean,
}
type SeName = 'miss' | 'hit' | 'show'

/**
 * base 1 second for 100px on screen,
 * TRACK_SCALE = 2 => 1 second for 200px
 */
const TRACK_SCALE = 4;

const CHICKEN_CONTAINER_INIT_X = 200;
const ENDED_SLOW_DOWN_DURATION = 5000;

@injectable()
export class GameScene extends BaseScene {
  readonly assets: string[] = [
    ...Chicken.assets,
    ...HittedChicken.assets,
    ...Root.assets,
    ...Potato.assets,
    bgImg, groundImg,
    cloud1Img, cloud2Img, cloud3Img,
    houseImg,
  ]

  private bg?: PIXI.TilingSprite;
  private ground?: PIXI.TilingSprite;
  private chickenContainer?: PIXI.Container;
  private house?: PIXI.Sprite;

  private audioContext?: AudioContext;
  private bgm?: AudioBufferSourceNode;
  private seBuffers: Partial<Record<SeName, AudioBuffer[]>> = {};

  private started: boolean = false;
  private endedTime?: number;

  private potato?: Potato
  private root?: Root;
  private _chickens: Chicken[] = []

  private _onGameStarted?: Subscription
  private _onGameEnded?: Subscription
  private _onGameHit?: Subscription
  private _onGameHitted?: Subscription
  private _onGameMissed?: Subscription
  private _onSpawnChicken?: Subscription

  private readonly usecase: GameUseCase
  private readonly evtGameStarted: Subject<GameStartedEvent>
  private readonly evtGameEnded: Subject<GameEndedEvent>
  private readonly evtGameHit: Subject<GameHitEvent>
  private readonly evtGameHitted: Subject<GameHittedEvent>
  private readonly evtGameMissed: Subject<GameMissedEvent>
  private readonly evtSeek: Subject<SeekEvent>
  private readonly evtSpawnChicken: Subject<SpawnChickenEvent>
  private readonly evtLoadTrack: Subject<LoadTrackEvent>

  constructor(
    @inject(GameUseCase) usecase: GameUseCase,
    @inject(GameStartedEventType) evtGameStarted: Subject<GameStartedEvent>,
    @inject(GameEndedEventType) evtGameEnded: Subject<GameEndedEvent>,
    @inject(GameHitEventType) evtGameHit: Subject<GameHitEvent>,
    @inject(GameHittedEventType) evtGameHitted: Subject<GameHittedEvent>,
    @inject(GameMissedEventType) evtGameMissed: Subject<GameMissedEvent>,
    @inject(SeekEventType) evtSeek: Subject<SeekEvent>,
    @inject(SpawnChickenEventType) evtSpawnChicken: Subject<SpawnChickenEvent>,
    @inject(LoadTrackEventType) evtLoadTrack: Subject<LoadTrackEvent>,
  ) {
    super()
    this.usecase = usecase
    this.evtGameStarted = evtGameStarted
    this.evtGameEnded = evtGameEnded
    this.evtGameHit = evtGameHit
    this.evtGameHitted = evtGameHitted
    this.evtGameMissed = evtGameMissed
    this.evtSeek = evtSeek
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

    this.seBuffers.hit = await Promise.all(
      [seChickenHitOgg1, seChickenHitOgg2, seChickenHitOgg3, seChickenHitOgg4].map(ogg => (
        loadAudioBuffer(ogg, this.audioContext!)
      ))
    )
    this.seBuffers.miss = await Promise.all(
      [
        seChickenMissOgg1, seChickenMissOgg2,
        seChickenNormalOgg1, seChickenNormalOgg2,
        seChickenNormalOgg3, seChickenNormalOgg4,
        seChickenNormalOgg5,
      ].map(ogg => (
        loadAudioBuffer(ogg, this.audioContext!)
      ))
    )
    this.seBuffers.show = await Promise.all(
      [
        seUsShowOgg1, seUsShowOgg2, seUsShowOgg3,
      ].map(ogg => (
        loadAudioBuffer(ogg, this.audioContext!)
      ))
    )

    const midi = await loadMidi(notesMidi);
    const MIDI_SPEED = 2.5;
    const { notes } = midi.track[0].event.reduce(({ notes, accTime }: { notes: Note[], accTime: number }, event: any) => {
      if (event.type === 9 && event.data?.[1] === 80) {
        const newAccTime = accTime + event.deltaTime / (midi.timeDivision * MIDI_SPEED) * 1000 + 400;
        const note = { time: newAccTime, data: event.data };
        return { notes: [...notes, note], accTime: newAccTime };
      }
      return { notes, accTime }
    }, { notes: [], accTime: -400 });
    this.evtLoadTrack.next({ id: notesMidi, notes: notes })
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
    this.ground.position.y = 600
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
    this.chickenContainer.position.set(CHICKEN_CONTAINER_INIT_X, 440);
    this.addChild(this.chickenContainer)

    this._onSpawnChicken = this.evtSpawnChicken.subscribe(this.onSpawnChicken)

    this.root = new Root(240, 530)
    this.addChild(this.root)

    this.potato = new Potato(1100, 150)
    this.addChild(this.potato)

    this._onGameStarted = this.evtGameStarted.subscribe(this.onGameStarted)
    this.evtGameHit.subscribe(this.onGameHit)

    this._onGameHitted = this.evtGameHitted.subscribe(evt => {
      console.log('this._onGameHitted', evt.index)

      this.playSe('hit')
      setTimeout(() => {
        const targetChicken: PIXI.AnimatedSprite | undefined = this._chickens[evt.index]
        const hittedChicken: PIXI.AnimatedSprite = new HittedChicken(targetChicken!.position.x, -10)
        hittedChicken.play()
        targetChicken?.destroy()
        this.chickenContainer?.addChild(hittedChicken)
      }, 100)
    })

    this._onGameMissed = this.evtGameMissed.subscribe(evt => {
      console.log('this._onGameMissed', evt.index)

      this.playSe('miss')
    })

    this._onGameEnded = this.evtGameEnded.subscribe(evt => {
      this.endedTime = evt.endedAt
      this.house = new PIXI.Sprite(PIXI.Texture.from(houseImg))
      this.house.position.set(650 * TRACK_SCALE, 200);
      this.addChild(this.house)
    })
  }

  onUpdate = (delta: number) => {
    this.evtSeek.next({ currentTime: (this.audioContext?.currentTime || 0) * 1000 })

    if (this.started) {
      const slowDown = this.endedTime ? Math.max((ENDED_SLOW_DOWN_DURATION - (Date.now() - this.endedTime)) / ENDED_SLOW_DOWN_DURATION, 0) : 1
      const groundSpeed = delta * 3 * TRACK_SCALE * slowDown;
      if (this.ground) {
        this.ground.tilePosition.x -= groundSpeed;
      }
      if (this.chickenContainer) {
        this.chickenContainer.position.x = CHICKEN_CONTAINER_INIT_X - this.audioContext!.currentTime * 100 * TRACK_SCALE;
      }
      if (this.house) {
        this.house.position.x -= groundSpeed;
      }
    }
  }

  onGameStarted = () => {
    this.started = true
    this.bgm?.start()
    this.playSe('show')
  }

  onGameHit = () => {
    this.root?.gotoAndPlay(0)
    this.potato?.cast()
  }

  onSpawnChicken = (evt: SpawnChickenEvent) => {
    const chicken = new Chicken(evt.position.x, evt.position.y)
    chicken.play()
    this._chickens[evt.index] = chicken
    this.chickenContainer?.addChild(chicken)
  }

  onDestroyed = () => {
    this._onGameStarted?.unsubscribe()
    this._onGameEnded?.unsubscribe()
    this._onGameHit?.unsubscribe()
    this._onGameHitted?.unsubscribe()
    this._onGameMissed?.unsubscribe()
    this._onSpawnChicken?.unsubscribe()
  }

  playSe = (seName: SeName) => {
    if (this.audioContext) {
      const candidates = this.seBuffers[seName];
      if (candidates) {
        const se = this.audioContext.createBufferSource();
        se.connect(this.audioContext.destination);
        se.buffer = candidates[Math.floor(candidates.length * Math.random())];
        se.start();
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
