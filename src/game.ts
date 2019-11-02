import Stats from 'stats.js';
import {regionsCollide, seperateGameObjects} from './collision/collisions';
import {QuadTree} from './collision/quad_tree';
import {SpatialHash} from './collision/spatial_hash';
import {GameState} from './models/game_state';
import {Ship} from './ship';
import {randomInt} from './util/random';
import * as PIXI from 'pixi.js';

/**
 * The number of milliseconds that should be simulated in each update
 * step within the game loop.
 */
const FIXED_UPDATE_STEP_MS = 1000 / 60;

/**
 * The maximum number of updates to perform per frame.
 */
const MAX_UPDATES_PER_TICK = 10;

export class Game {
  stats: Stats;
  renderer: PIXI.Renderer;
  state: GameState;
  graphics: PIXI.Graphics;

  quadTree: QuadTree;
  spatialHash: SpatialHash;

  ships: Ship[] = [];

  constructor() {
    // Setup FPS stats
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);

    // Setup PIXI Renderer
    this.renderer = new PIXI.Renderer({
      width: 1000,
      height: 800,
    });
    document.body.appendChild(this.renderer.view);

    // State
    const stage = new PIXI.Container();
    const bounds = appRegion(this.renderer.view);
    this.graphics = new PIXI.Graphics();
    this.state = new GameState(bounds, stage);
    this.state.stage.addChild(this.graphics);

    // Collision detection.

    // TODO(scott): move this to a different collision class.
    this.quadTree = new QuadTree({
      region: bounds,
      maxDepth: 7,
      maxNodePop: 4,
    });

    this.spatialHash = new SpatialHash({gridSize: 128});
  }

  public start() {
    const loader = PIXI.Loader.shared;
    loader.add('assets/ship.gif');
    loader.load(() => {
      this.setup();
      this.startGameLoop();
    });
  }

  private startGameLoop() {
    let lastTimestamp = performance.now();
    let accumlator = 0;

    const step = () => {
      this.stats.begin();

      requestAnimationFrame(step);

      const now = performance.now();
      const delta = Math.min(now - lastTimestamp, 1000);
      accumlator += delta;

      let updates = 0;
      while (
        accumlator > FIXED_UPDATE_STEP_MS &&
        updates < MAX_UPDATES_PER_TICK
      ) {
        this.update(FIXED_UPDATE_STEP_MS / 1000);
        accumlator -= FIXED_UPDATE_STEP_MS;
        updates++;
      }

      this.render();
      lastTimestamp = now;
      this.stats.end();
    };

    requestAnimationFrame(step);
  }

  private setup() {
    for (let i = 0; i < 1000; i++) {
      const ship = new Ship(this.state);
      ship.p.x = randomInt(0, this.renderer.view.width);
      ship.p.y = randomInt(0, this.renderer.view.height);
      ship.v.x = randomInt(-70, 70);
      ship.v.y = randomInt(-70, 70);
      ship.rotation = randomInt(0, 360);
      this.ships.push(ship);
    }

    for (const ship of this.ships) {
      this.quadTree.add(ship);
      this.spatialHash.add(ship);
    }
  }

  private update(delta: number) {
    for (const ship of this.ships) {
      ship.update(delta);
      this.spatialHash.move(ship);
    }

    this.quadTree.cleanup();

    for (const ship of this.ships) {
      // const others = quadTree.query(ship);
      const others = this.spatialHash.query(ship);
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

  private render() {
    this.renderer.render(this.state.stage);

    this.graphics.clear();
    for (const ship of this.ships) {
      ship.render(this.graphics);
    }

    this.quadTree.render(this.graphics);
  }
}

function appRegion(view: HTMLCanvasElement) {
  return {left: 0, top: 0, right: view.width, bottom: view.height};
}
