import * as PIXI from 'pixi.js';
import Stats from 'stats.js';
import {Ship} from './ship';
import {randomInt} from './util/random';
import {regionsCollide, seperateGameObjects} from './collision/collisions';
import {Vector} from './util/vector';
import {QuadTree} from './collision/quad_tree';

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

const quadTree = new QuadTree({
  top: 0,
  left: 0,
  right: app.view.width,
  bottom: app.view.height,
});

loader.load((loader, resources) => {
  for (let i = 0; i < 50; i++) {
    const ship = new Ship(app);
    ship.p.x = randomInt(0, app.view.width);
    ship.p.y = randomInt(0, app.view.height);
    ship.v.x = randomInt(-50, 50);
    ship.v.y = randomInt(-50, 50);
    ship.rotation = randomInt(0, 360);
    ships.push(ship);
  }

  const ship1 = new Ship(app);
  ship1.x = 210;
  ship1.y = 220;
  ship1.v.set(100, 0);

  const ship2 = new Ship(app);
  ship2.x = 280;
  ship2.y = 220;
  ship2.v.set(-100, 0);

  ships.push(ship1, ship2);

  for (const ship of ships) {
    quadTree.add(ship);
  }
  app.stage.addChild(graphics);

  app.ticker.add(() => {
    stats.begin();
    const deltaMS = app.ticker.deltaMS;
    const delta = deltaMS / 1000;

    for (const ship of ships) {
      ship.update(delta);
      quadTree.move(ship);
    }

    for (const ship of ships) {
      const others = quadTree.query(ship);
      // const others = ships;
      // const others = [];

      for (const other of others) {
        if (ship === other) continue;

        if (regionsCollide(ship, other)) {
          seperateGameObjects(ship, other);
        }
      }
    }

    graphics.clear();
    for (const ship of ships) {
      ship.render(graphics);

      const n = quadTree.objectToNode.get(ship);
      if (n) {
        const r = n.region;
        graphics.lineStyle(1, 0x3352ff, 1);
        graphics.moveTo(r.left, r.top);
        graphics.lineTo(ship.x, ship.y);
        // graphics.drawRect(r.left, r.top, regionWidth(r), regionHeight(r));
      }
    }

    quadTree.render(graphics);

    stats.end();
  });
});
