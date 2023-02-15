import {ComponentGroup} from './components/component_group';
import {PhysicsComponent} from './components/physics_component';
import {SpriteComponent} from './components/sprite_component';
import {WorldBoundsComponent} from './components/world_bounds_component';
import {BaseGameObject} from './models/base_game_object';
import {GameState} from './models/game_state';
import {DebugComponent} from './components/debug_component';
import {Key} from './input';
import {regionMidX, regionMidY} from './util/regions';
import {Graphics} from 'pixi.js';
import {GameImage} from './resources';

const SPEED = 150; // units/s

export class Player extends BaseGameObject {
  public components = new ComponentGroup([
    new SpriteComponent(this, this.state, GameImage.SHIP, {
      scale: 0.8,
    }),
    new PhysicsComponent(this),
    new WorldBoundsComponent(this, this.state.bounds),
    new DebugComponent(this),
  ]);

  constructor(private state: GameState) {
    super();
    this.p.x = 300;
    this.p.y = 300;
    this.height = 32;
    this.width = 32;
  }

  public update(delta: number) {
    // We have to process user input after already applying the prior
    // velocity. This is because collisions may have applied an inpulse
    // and changed the velocity in such a way as to correct the overlap.
    // If we change our velocity now and immediatly apply it, we would
    // let the player ignore this.
    this.v.set(0, 0);

    if (this.state.input.isPressed(Key.W)) {
      this.v.addValues(0, -SPEED);
    } else if (this.state.input.isPressed(Key.S)) {
      this.v.addValues(0, SPEED);
    }

    if (this.state.input.isPressed(Key.A)) {
      this.v.addValues(-SPEED, 0);
    } else if (this.state.input.isPressed(Key.D)) {
      this.v.addValues(SPEED, 0);
    }
    this.components.update(delta);
  }

  public render(graphics: Graphics) {
    this.components.render(graphics);
  }
}
