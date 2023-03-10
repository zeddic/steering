import {ComponentGroup} from './components/component_group';
import {PhysicsComponent} from './components/physics_component';
import {SpriteComponent} from './components/sprite_component';
import {WorldBoundsComponent} from './components/world_bounds_component';
import {BaseGameObject} from './models/base_game_object';
import {GameState} from './models/game_state';
import {DebugComponent} from './components/debug_component';
import {Graphics} from 'pixi.js';
import {GameImage} from './resources';
import {SeekBeahvior} from './components/behaviors/seek_behavior';
import {FlockBehavior} from './components/behaviors/flock_behavior';

export class Fish extends BaseGameObject {
  public components = new ComponentGroup([
    new SpriteComponent(this, this.state, GameImage.FISH, {
      scale: 0.8,
    }),
    new PhysicsComponent(this),
    new WorldBoundsComponent(this, this.state.bounds),
    new FlockBehavior(this, this.state),
    // new DebugComponent(this),
  ]);

  constructor(private state: GameState) {
    super();
    this.p.x = 0;
    this.p.y = 0;
    this.height = 18;
    this.width = 18;
    this.maxForce = 10000;
    this.maxSpeed = 200;
    this.type = 'small';
  }

  public update(deltaMs: number) {
    this.components.update(deltaMs);
  }

  public render(graphics: Graphics) {
    this.components.render(graphics);
  }
}
