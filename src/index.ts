import * as PIXI from 'pixi.js';
import Stats from 'stats.js';
import {regionsCollide, seperateGameObjects} from './collision/collisions';
import {QuadTree} from './collision/quad_tree';
import {SpatialHash} from './collision/spatial_hash';
import {Ship} from './ship';
import {randomInt} from './util/random';
import {GameState} from './models/game_state';

// Setup FPS stats
const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

// Add PIXI Renderer.
const renderer = new PIXI.Renderer({
  width: 2000,
  height: 2000,
});

document.body.appendChild(renderer.view);

const worldBounds = appRegion(renderer.view);
const stage = new PIXI.Container();
const state = new GameState(worldBounds, stage);

const ships: Ship[] = [];
const graphics = new PIXI.Graphics();

// Setup some collision structures for testing.
const quadTree = new QuadTree({
  region: {
    top: 0,
    left: 0,
    right: renderer.view.width,
    bottom: renderer.view.height,
  },
  maxDepth: 7,
  maxNodePop: 4,
});

const spatialHash = new SpatialHash({gridSize: 128});

// TOOD(baileys): Stop depending on a singleton.
const loader = PIXI.Loader.shared;
loader.add('assets/ship.gif');
loader.load(() => {
  setup();
  startGameLoop();
});

const FIXED_UPDATE_STEP_MS = 1000 / 60;
const MAX_UPDATES_PER_TICK = 10;

function startGameLoop() {
  let lastTimestamp = performance.now();
  let accumlator = 0;

  const step = () => {
    stats.begin();

    requestAnimationFrame(step);

    const now = performance.now();
    const delta = Math.min(now - lastTimestamp, 1000);
    accumlator += delta;

    let updates = 0;
    while (
      accumlator > FIXED_UPDATE_STEP_MS &&
      updates < MAX_UPDATES_PER_TICK
    ) {
      updateGame(FIXED_UPDATE_STEP_MS / 1000);
      accumlator -= FIXED_UPDATE_STEP_MS;
      updates++;
    }

    renderGame();
    lastTimestamp = now;
    stats.end();
  };

  requestAnimationFrame(step);
}

function setup() {
  for (let i = 0; i < 1000; i++) {
    const ship = new Ship(state);
    ship.p.x = randomInt(0, renderer.view.width);
    ship.p.y = randomInt(0, renderer.view.height);
    ship.v.x = randomInt(-70, 70);
    ship.v.y = randomInt(-70, 70);
    ship.rotation = randomInt(0, 360);
    ships.push(ship);
  }

  for (const ship of ships) {
    quadTree.add(ship);
    spatialHash.add(ship);
  }
  stage.addChild(graphics);
}

function updateGame(delta: number) {
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
}

function renderGame() {
  renderer.render(stage);

  graphics.clear();
  for (const ship of ships) {
    ship.render(graphics);
  }

  quadTree.render(graphics);
}

function appRegion(view: HTMLCanvasElement) {
  return {left: 0, top: 0, right: view.width, bottom: view.height};
}
