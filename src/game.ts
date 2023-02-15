import * as PIXI from 'pixi.js';
import {Application, ICanvas} from 'pixi.js';
import Stats from 'stats.js';
import {CollisionSystem} from './collision/collision_system';
import {Input} from './input';
import {GameState} from './models/game_state';
import {Player} from './player';
import {Fish} from './fish';
import {World} from './world';
import {randomInt} from './util/random';
import {BigFish} from './big_fish';

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
  private stats: Stats;
  private app: PIXI.Application;
  private graphics: PIXI.Graphics;
  private renderer: PIXI.IRenderer;

  state: GameState;
  fish: Fish[] = [];
  big!: BigFish;

  world!: World;
  player!: Player;

  constructor() {
    // Setup FPS stats
    this.stats = new Stats();
    this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(this.stats.dom);

    this.app = new Application({
      view: document.getElementById('pixi-canvas') as HTMLCanvasElement,
      resolution: window.devicePixelRatio || 1,
      resizeTo: window,
      autoDensity: true,
      backgroundColor: '0077b6',
      // backgroundColor: 0x6495ed,
    });

    this.renderer = this.app.renderer;

    // Game State
    const stage = new PIXI.Container();
    const graphics = new PIXI.Graphics();
    stage.addChild(graphics);

    const bounds = appRegion(this.renderer.view);
    this.world = new World(bounds);
    this.state = new GameState(this.world, stage, graphics, new Input());
    this.graphics = graphics;
  }

  public start() {
    this.setup();
    this.startGameLoop();
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
      while (accumlator > FIXED_UPDATE_STEP_MS && updates < MAX_UPDATES_PER_TICK) {
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
    // this.player = new Player(this.state);
    // this.player.x;
    // this.world.collisionSystem.add(this.player);

    this.big = new BigFish(this.state);
    this.big.p.x = 1000;
    this.big.p.y = 1000;
    this.world.collisionSystem.add(this.big);

    // this.player = new Player(this.state);
    // this.player.x;
    // this.world.collisionSystem.add(this.player);

    for (let i = 0; i < 300; i++) {
      const fish = new Fish(this.state);
      fish.p.x = randomInt(0, this.renderer.view.width);
      fish.p.y = randomInt(0, this.renderer.view.height);
      fish.v.x = randomInt(-70, 70);
      fish.v.y = randomInt(-70, 70);
      fish.rotation = randomInt(0, 360);
      this.fish.push(fish);
    }

    // const ship = new Fish(this.state);
    // ship.p.set(200, 350);
    // ship.v.set(-30, -30);
    // this.fish.push(ship);
    // ship.v.x = randomInt(-70, 70);
    // ship.v.y = randomInt(-70, 70);

    this.world.collisionSystem.addAll(this.fish);
  }

  /**
   * Updates the game by one simulation step.
   * @param delta The number of seconds since the last call to update.
   */
  private update(delta: number) {
    for (const fish of this.fish) {
      fish.update(delta);
      this.world.collisionSystem.move(fish);
    }

    this.big.update(delta);
    this.world.collisionSystem.move(this.big);

    // this.player.update(delta);
    // this.world.collisionSystem.move(this.player);

    this.world.update(delta);
    this.world.collisionSystem.resolveCollisions();
  }

  /**
   * Renders the game.
   */
  private render() {
    this.graphics.clear();

    this.world.render(this.graphics);

    for (const ship of this.fish) {
      ship.render(this.graphics);
    }
    // this.player.render(this.graphics);
    this.big.render(this.graphics);

    this.world.collisionSystem.render(this.graphics);

    this.renderer.render(this.state.stage);
  }
}

function appRegion(view: ICanvas) {
  return {left: 0, top: 0, right: view.width, bottom: view.height};
}
