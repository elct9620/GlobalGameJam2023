import { inject, injectable } from 'inversify'
import { Subscription } from 'rxjs'
import * as PIXI from 'pixi.js'
import 'reflect-metadata'
import gsap from 'gsap'

import { loadAudioBuffer, encodeMidiFrom, AudioController } from '../../utils'
import { BaseScene } from './BaseScene'
import {
  Chicken,
  HittedChicken,
  Root,
  Potato,
} from '../entities'
import { GameUseCase } from '../../core/usecase'
import {
  onGameStarted,
  onGameEnded,
  onGameHitted,
  onGameMissed,
  onSpawnChicken,
  onInput,
  emitLoadTrack,
  GameStartedPayload,
  GameEndedPayload,
  GameHittedPayload,
  SpawnChickenPayload,
  KeyboardPayload,
} from '../events'

import bgImg from '@/assets/bg.jpg';
import groundImg from '@/assets/ground.png';

import startPanelImg from '@/assets/start_panel.png';
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
  seUsHit1, seUsHit2,
  bgmFinishWinOgg1, bgmFinishLoseOgg2,
} from '@/assets/ogg/'

type SFXName = 'miss' | 'hit' | 'show' | 'cast' | 'win' | 'lose'

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
    bgImg, groundImg, startPanelImg,
    houseImg,
    winBgImg, loseBgImg, finishPanelImg, againBtnImg,
  ]

  private bg?: PIXI.TilingSprite;
  private ground?: PIXI.TilingSprite;
  private startPanel?: PIXI.Sprite;
  private chickenContainer?: PIXI.Container;
  private house?: PIXI.Sprite;

  private audioContext?: AudioContext;
  private bgm?: AudioBufferSourceNode;
  private sfx: Partial<Record<SFXName, AudioController>> = {};

  private startedAt?: number
  private endedAt?: number;
  private finalScore?: { captured: number, total: number };
  private finalShowed: boolean = false;

  private potato?: Potato
  private root?: Root;
  private _chickens: Chicken[] = []

  private _onGameStarted?: Subscription
  private _onGameEnded?: Subscription
  private _onInput?: Subscription
  private _onGameHitted?: Subscription
  private _onGameMissed?: Subscription
  private _onSpawnChicken?: Subscription

  private readonly usecase: GameUseCase

  constructor(
    @inject(GameUseCase) usecase: GameUseCase,
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

    this.sfx.hit = new AudioController(this.audioContext)
    await this.sfx.hit.add(seChickenHitOgg1, seChickenHitOgg2, seChickenHitOgg3, seChickenHitOgg4)

    this.sfx.miss = new AudioController(this.audioContext)
    await this.sfx.miss.add(
      seChickenMissOgg1, seChickenMissOgg2, seChickenNormalOgg1, seChickenNormalOgg2,
      seChickenNormalOgg3, seChickenNormalOgg4, seChickenNormalOgg5,
    )

    this.sfx.show = new AudioController(this.audioContext)
    await this.sfx.show.add(seUsShowOgg1, seUsShowOgg2, seUsShowOgg3, seUsHitGetOgg1)

    this.sfx.cast = new AudioController(this.audioContext)
    await this.sfx.cast.add(seUsHit1, seUsHit2)

    this.sfx.win = new AudioController(this.audioContext)
    this.sfx.win.add(bgmFinishWinOgg1)

    this.sfx.lose = new AudioController(this.audioContext)
    this.sfx.lose.add(bgmFinishLoseOgg2)

    const { notes } = await encodeMidiFrom(notesMidi)
    emitLoadTrack({ id: notesMidi, notes: notes })
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
    this.ground.position.y = 525
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

    this.startPanel = new PIXI.Sprite(PIXI.Texture.from(startPanelImg))
    this.startPanel.scale.set(0.9, 0.9);
    this.startPanel.position.set(64, 36.15);
    this.addChild(this.startPanel)

    this.potato = new Potato(1100, 150)
    this.addChild(this.potato)

    this._onGameStarted = onGameStarted(this.onGameStarted)
    this._onGameEnded = onGameEnded(this.onGameEnded)
    this._onInput = onInput(this.onInput)
    this._onGameHitted = onGameHitted(this.onGameHitted)
    this._onGameMissed = onGameMissed(this.onGameMissed)
    this._onSpawnChicken = onSpawnChicken(this.onSpawnChicken)
  }

  onUpdate = (delta: number) => {

    if (this.startedAt && !this.finalShowed) {
      const deltaTime = (Date.now() - this.startedAt) / 1000

      const slowDown = this.endedAt ? Math.max((ENDED_SLOW_DOWN_DURATION - (Date.now() - this.endedAt)) / ENDED_SLOW_DOWN_DURATION, 0) : 1
      if (slowDown <= 0) { this.showFinal() }
      const groundSpeed = delta * 3 * TRACK_SCALE * slowDown;
      if (this.ground) {
        this.ground.tilePosition.x -= groundSpeed;
      }
      if (this.chickenContainer) {
        this.chickenContainer.position.x = CHICKEN_CONTAINER_INIT_X - deltaTime * 100 * TRACK_SCALE;
      }
      if (this.house) {
        this.house.position.x -= groundSpeed;
      }
    }
  }

  onGameStarted = (evt: GameStartedPayload) => {
    this.startedAt = evt.startedAt
    this.bgm?.start()
    this.playSe('show')

    if (this.startPanel) {
      gsap.to(this.startPanel.position, {
        y: -1000, duration: 1, repeat: 0,
      });
    }
  }

  onGameEnded = (evt: GameEndedPayload) => {
    this.endedAt = evt.endedAt
    const { captured, total } = evt.score
    const isWin = getIsWin(captured, total);
    this.finalScore = { captured, total };
    this.playSe(isWin ? 'win' : 'lose');
    this.house = new PIXI.Sprite(PIXI.Texture.from(houseImg))
    this.house.position.set(650 * TRACK_SCALE, 200);
    this.addChild(this.house)
  }

  onInput = (evt: KeyboardPayload) => {
    if(evt.key == ' ' && !evt.pressed) {
      this.playSe('cast')
      this.root?.gotoAndPlay(0)
      this.potato?.cast()
    }
  }

  onGameHitted = (evt: GameHittedPayload) => {
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

  onSpawnChicken = (evt: SpawnChickenPayload) => {
    const chicken = new Chicken(evt.position.x, evt.position.y)
    chicken.play()
    this._chickens[evt.index] = chicken
    this.chickenContainer?.addChild(chicken)
  }

  onDestroyed = () => {
    this._onGameStarted?.unsubscribe()
    this._onGameEnded?.unsubscribe()
    this._onInput?.unsubscribe()
    this._onGameHitted?.unsubscribe()
    this._onGameMissed?.unsubscribe()
    this._onSpawnChicken?.unsubscribe()
  }

  playSe = (name: SFXName) => this.sfx[name]?.play()

  showFinal() {
    if (this.finalShowed || !this.finalScore) return;
    this.finalShowed = true

    const { captured, total } = this.finalScore;
    const isWin = getIsWin(captured, total);

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

function getIsWin(captured: number, total: number): boolean {
  return captured >= total * 0.8;
}
