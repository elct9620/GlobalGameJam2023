import Manager from '../manager'
import Container from '../container'
import {
  GameScene
} from '../scenes'

const manager = Container.get<Manager>(Manager)

manager.register('Game', GameScene)
Container.bind<GameScene>(GameScene).to(GameScene)
