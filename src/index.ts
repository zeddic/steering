import * as PIXI from 'pixi.js';
import Stats from 'stats.js';
import {regionsCollide, seperateGameObjects} from './collision/collisions';
import {QuadTree} from './collision/quad_tree';
import {Ship} from './ship';
import {randomInt} from './util/random';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const app = new PIXI.Application({
  width: 2000,
  height: 2000,
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
  for (let i = 0; i < 4000; i++) {
    const ship = new Ship(app);
    ship.p.x = randomInt(0, app.view.width);
    ship.p.y = randomInt(0, app.view.height);
    ship.v.x = randomInt(-30, 30);
    ship.v.y = randomInt(-30, 30);
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

  // ships.push(ship1, ship2);

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

    quadTree.cleanup();

    for (const ship of ships) {
      const others = quadTree.query(ship);
      // const others = ships;
      // const others = [];

      // const hit = new Set<GameObject>();
      for (const other of others) {
        if (ship === other) continue;
        if (regionsCollide(ship, other)) {
          // hit.add(other);
          seperateGameObjects(ship, other);
        }
      }

      // for (const other of ships) {
      //   if (ship === other) continue;
      //   if (regionsCollide(ship, other)) {
      //     if (!hit.has(other)) {
      //       console.log('bad!');

      //       const r1 = quadTree.query(ship);

      //       const n1 = quadTree.getNode(ship);
      //       const n2 = quadTree.getNode(other);
      //       // const r2 = quadTree.query(other);
      //       console.log(n1);
      //       console.log(n2);
      //       const r2 = quadTree.query(ship);
      //     }
      //   }
      // }
    }

    graphics.clear();
    for (const ship of ships) {
      ship.render(graphics);
    }

    quadTree.render(graphics);

    stats.end();
  });
});
