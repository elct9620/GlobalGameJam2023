import './config'
import Manager from './manager'
import Container from './container'

import './style.css';

const manager = Container.get<Manager>(Manager)
manager.to('Game')
