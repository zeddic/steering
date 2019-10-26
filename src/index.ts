import * as PIXI from 'pixi.js';
import Stats from 'stats.js';
import {Ship} from './ship';
import {randomInt} from './util/random';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const app = new PIXI.Application();
document.body.appendChild(app.view);

const loader = app.loader.add('assets/ship.gif');
const ships: Ship[] = [];

loader.load((loader, resources) => {
  for (let i = 0; i < 100; i++) {
    const ship = new Ship(app);
    ship.p.x = randomInt(0, app.view.width);
    ship.p.y = randomInt(0, app.view.height);
    ship.v.x = randomInt(-50, 50);
    ship.v.y = randomInt(-50, 50);
    ship.rotation = randomInt(0, 360);
    ships.push(ship);
  }

  app.ticker.add(() => {
    stats.begin();
    const deltaMS = app.ticker.deltaMS;
    const delta = deltaMS / 1000;

    for (const ship of ships) {
      ship.update(delta);
    }
    stats.end();
  });
});
