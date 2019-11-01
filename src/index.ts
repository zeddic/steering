import * as PIXI from 'pixi.js';
import Stats from 'stats.js';
import {regionsCollide, seperateGameObjects} from './collision/collisions';
import {QuadTree} from './collision/quad_tree';
import {SpatialHash} from './collision/spatial_hash';
import {Ship} from './ship';
import {randomInt} from './util/random';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const app = new PIXI.Application({
  width: 4000,
  height: 4000,
});
document.body.appendChild(app.view);

const loader = app.loader.add('assets/ship.gif');
const ships: Ship[] = [];
const graphics = new PIXI.Graphics();

const quadTree = new QuadTree({
  region: {
    top: 0,
    left: 0,
    right: app.view.width,
    bottom: app.view.height,
  },
  maxDepth: 7,
  maxNodePop: 4,
});

const spatialHash = new SpatialHash({gridSize: 128});

loader.load((loader, resources) => {
  for (let i = 0; i < 1000; i++) {
    const ship = new Ship(app);
    ship.p.x = randomInt(0, app.view.width);
    ship.p.y = randomInt(0, app.view.height);
    ship.v.x = randomInt(-70, 70);
    ship.v.y = randomInt(-70, 70);
    ship.rotation = randomInt(0, 360);
    ships.push(ship);
  }

  for (const ship of ships) {
    quadTree.add(ship);
    spatialHash.add(ship);
  }
  app.stage.addChild(graphics);

  app.ticker.add(() => {
    stats.begin();
    const deltaMS = app.ticker.deltaMS;
    const delta = deltaMS / 1000;

    for (const ship of ships) {
      ship.update(delta);
      spatialHash.move(ship);
    }

    quadTree.cleanup();

    for (const ship of ships) {
      // const others = quadTree.query(ship);
      const others = spatialHash.query(ship);
      for (const other of others) {
        if (ship === other) {
          continue;
        }
        if (regionsCollide(ship, other)) {
          seperateGameObjects(ship, other);
        }
      }
    }

    graphics.clear();
    for (const ship of ships) {
      ship.render(graphics);
    }

    quadTree.render(graphics);

    stats.end();
  });
});
