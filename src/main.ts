import * as PIXI from 'pixi.js';

import './style.css';

const app = new PIXI.Application({
  resizeTo: window,
  resolution: devicePixelRatio,
  background: '#FFFFFF',
});
document.body.appendChild(app.view as unknown as Node);
