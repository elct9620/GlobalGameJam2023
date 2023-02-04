import * as PIXI from 'pixi.js';

import './style.css';

new PIXI.Application({
  view: document.getElementById("view") as HTMLCanvasElement,
  resizeTo: window,
  resolution: devicePixelRatio || 1,
  autoDensity: true,
  background: '#000000',
});
