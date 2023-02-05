import { inject, injectable } from 'inversify'
import { Subject, Subscription } from 'rxjs'
import * as PIXI from 'pixi.js'
import 'reflect-metadata'
import gsap from 'gsap'

import { loadAudioBuffer, encodeMidiFrom } from '../utils'
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

import houseImg from '@/assets/house.png';
import winBgImg from '@/assets/win_bg.jpg';
import loseBgImg from '@/assets/lose_bg.png';
import finishPanelImg from '@/assets/finish_panel.png';
import againBtnImg from '@/assets/again_btn.png';

import {
  bgmOgg, notesMidi,

  seChickenHitOgg1, seChickenHitOgg2, seChickenHitOgg3, seChickenHitOgg4,
  seChickenMissOgg1, seChickenMissOgg2,
  seChickenNormalOgg1, seChickenNormalOgg2, seChickenNormalOgg3, seChickenNormalOgg4, seChickenNormalOgg5,
  seUsShowOgg1, seUsShowOgg2, seUsShowOgg3, seUsHitGetOgg1,
  seUsHit1, seUsHit2, seUsMiss1,
  bgmFinishOgg1, bgmFinishOgg2,
} from '@/assets/ogg/'

type SeName = 'miss' | 'hit' | 'show' | 'cast' | 'finish'

const cloudAssets = Object.values(import.meta.glob('@/assets/cloud*.png', { eager: true, as: 'url' }))
const CLOUD_MINIFEST = [
  { scale: [0.2, 0.2], position: [40, 50] },
  { scale: [0.2, 0.2], position: [420, 30] },
  { scale: [0.2, 0.2], position: [1100, 70] },
]

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
    ...cloudAssets,
    bgImg, groundImg,
    houseImg,
    winBgImg, loseBgImg, finishPanelImg, againBtnImg,
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
  private finalScore?: { captured: number, total: number };
  private finalShowed: boolean = false;

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
        seUsShowOgg1, seUsShowOgg2, seUsShowOgg3, seUsHitGetOgg1,
      ].map(ogg => (
        loadAudioBuffer(ogg, this.audioContext!)
      ))
    )
    this.seBuffers.cast = await Promise.all(
      [
        seUsHit1, seUsHit2, seUsMiss1,
      ].map(ogg => (
        loadAudioBuffer(ogg, this.audioContext!)
      ))
    )
    this.seBuffers.cast = await Promise.all(
      [
        seUsHit1, seUsHit2, seUsMiss1,
      ].map(ogg => (
        loadAudioBuffer(ogg, this.audioContext!)
      ))
    )
    this.seBuffers.finish = await Promise.all(
      [
        bgmFinishOgg1, bgmFinishOgg2,
      ].map(ogg => (
        loadAudioBuffer(ogg, this.audioContext!)
      ))
    )

    const { notes } = await encodeMidiFrom(notesMidi, 2.5)
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

    cloudAssets.forEach((path, index) => {
      const cloud = new PIXI.Sprite(PIXI.Assets.get(path))
      const minifest = CLOUD_MINIFEST[index]
      cloud.scale.set(...minifest.scale)
      cloud.position.set(...minifest.position)

      this.addChild(cloud)
    })

    this.chickenContainer = new PIXI.Container()
    this.chickenContainer.position.set(CHICKEN_CONTAINER_INIT_X, 440);
    this.addChild(this.chickenContainer)


    this.root = new Root(240, 530)
    this.addChild(this.root)

    this.potato = new Potato(1100, 150)
    this.addChild(this.potato)

    this._onGameStarted = this.evtGameStarted.subscribe(this.onGameStarted)
    this._onGameEnded = this.evtGameEnded.subscribe(this.onGameEnded)
    this.evtGameHit.subscribe(this.onGameHit)
    this._onGameHitted = this.evtGameHitted.subscribe(this.onGameHitted)
    this._onGameMissed = this.evtGameMissed.subscribe(this.onGameMissed)
    this._onSpawnChicken = this.evtSpawnChicken.subscribe(this.onSpawnChicken)
  }

  onUpdate = (delta: number) => {
    this.evtSeek.next({ currentTime: (this.audioContext?.currentTime || 0) * 1000 })

    if (this.started && !this.finalShowed) {
      const slowDown = this.endedTime ? Math.max((ENDED_SLOW_DOWN_DURATION - (Date.now() - this.endedTime)) / ENDED_SLOW_DOWN_DURATION, 0) : 1
      if (slowDown <= 0) { this.showFinal() }
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

  onGameEnded = (evt: GameEndedEvent) => {
    this.endedTime = evt.endedAt
    this.finalScore = { captured: evt.score.captured, total: evt.score.total };
    this.playSe('finish');
    this.house = new PIXI.Sprite(PIXI.Texture.from(houseImg))
    this.house.position.set(650 * TRACK_SCALE, 200);
    this.addChild(this.house)
  }

  onGameHit = () => {
    this.playSe('cast')
    this.root?.gotoAndPlay(0)
    this.potato?.cast()
  }

  onGameHitted = (evt: GameHittedEvent) => {
    this.playSe('hit')
    setTimeout(() => {
      const targetChicken: PIXI.AnimatedSprite | undefined = this._chickens[evt.index]
      const hittedChicken: PIXI.AnimatedSprite = new HittedChicken(targetChicken!.position.x, -10)
      hittedChicken.play()
      targetChicken?.destroy()
      this.chickenContainer?.addChild(hittedChicken)
    }, 100)
  }

  onGameMissed = () => this.playSe('miss')

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

  showFinal() {
    if (this.finalShowed || !this.finalScore) return;
    this.finalShowed = true

    const { captured, total } = this.finalScore;
    const isWin = captured >= total * 0.8;

    const winBg = new PIXI.Sprite(PIXI.Texture.from(isWin ? winBgImg : loseBgImg));
    winBg.alpha = 0;
    this.addChild(winBg);
    gsap.to(winBg, {
      alpha: 1, duration: 1, repeat: 0,
    });

    const panelContainer = new PIXI.Container()

    const finishPanel = new PIXI.Sprite(PIXI.Texture.from(finishPanelImg))
    finishPanel.position.set(0, 0);
    panelContainer.addChild(finishPanel);

    const finishText = new PIXI.Text(isWin ? 'WIN' : 'LOSE', {
      fontSize: 120, fill: '#ffb228', fontWeight: 'bold',
      dropShadow: true, dropShadowBlur: 15, dropShadowDistance: 0,
    })
    finishText.anchor.set(0.5, 0.5);
    finishText.position.set(380, 80);
    panelContainer.addChild(finishText);

    const chickenHit = new HittedChicken(0, 0);
    chickenHit.play()
    chickenHit.scale.set(0.8, 0.8);
    chickenHit.position.set(50, 170);
    panelContainer.addChild(chickenHit);

    const scoreText = new PIXI.Text(captured, {
      fontSize: 160, fill: '#FBFF37',
      dropShadow: true, dropShadowBlur: 15, dropShadowDistance: 0,
    })
    scoreText.position.set(350, 200)
    panelContainer.addChild(scoreText)

    const totalText = new PIXI.Text(`/ ${total}`, {
      fontSize: 54, fill: 'black',
    })
    totalText.position.set(530, 290)
    panelContainer.addChild(totalText)

    if (captured >= total) {
      const fullCombo = new PIXI.Text(`- Full combo -`, { fontSize: 45, fill: '#b22406' })
      fullCombo.position.set(350, 380)
      panelContainer.addChild(fullCombo)
    }

    const button = new PIXI.Sprite(PIXI.Texture.from(againBtnImg))
    button.scale.set(0.5, 0.5)
    button.position.set(300, 450)
    button.interactive = true;
    button.on('pointerdown', () => location.reload())
    panelContainer.addChild(button)

    panelContainer.position.set(1500, 100);
    this.addChild(panelContainer);
    gsap.to(panelContainer.position, {
      x: 400, duration: 1, repeat: 0,
    });
  }
}
