import './config/environment'
import './config/scenes'

import Manager from './manager'
import Container from './container'

import './style.css';

const manager = Container.get<Manager>(Manager)
manager.to('Game')
