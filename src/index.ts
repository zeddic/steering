import * as PIXI from 'pixi.js';
import Stats from 'stats.js';
import {Ship} from './ship';
import {randomInt} from './util/random';
import {regionsCollide, seperateGameObjects} from './collision/collisions';
import {Vector} from './util/vector';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const app = new PIXI.Application({
  width: 1000,
  height: 900,
});
document.body.appendChild(app.view);

const loader = app.loader.add('assets/ship.gif');
const ships: Ship[] = [];
const graphics = new PIXI.Graphics();

loader.load((loader, resources) => {
  for (let i = 0; i < 400; i++) {
    const ship = new Ship(app);
    ship.p.x = randomInt(0, app.view.width);
    ship.p.y = randomInt(0, app.view.height);
    ship.v.x = randomInt(-50, 50);
    ship.v.y = randomInt(-50, 50);
    ship.rotation = randomInt(0, 360);
    ships.push(ship);
  }

  // const ship1 = new Ship(app);
  // ship1.x = 100;
  // ship1.y = 100;
  // ship1.v.set(40, 40);

  // const ship2 = new Ship(app);
  // ship2.x = 300;
  // ship2.y = 300;
  // ship2.v.set(-40, -30);

  // ships.push(ship1, ship2);

  app.stage.addChild(graphics);

  app.ticker.add(() => {
    stats.begin();
    const deltaMS = app.ticker.deltaMS;
    const delta = deltaMS / 1000;

    for (const ship of ships) {
      ship.update(delta);
    }

    for (const ship of ships) {
      for (const other of ships) {
        if (ship === other) continue;

        if (regionsCollide(ship, other)) {
          seperateGameObjects(ship, other);
        }
      }
    }

    graphics.clear();
    for (const ship of ships) {
      ship.render(graphics);
    }

    stats.end();
  });
});
