import {ComponentGroup} from './components/component_group';
import {PhysicsComponent} from './components/physics_component';
import {SpriteComponent} from './components/sprite_component';
import {WorldBoundsComponent} from './components/world_bounds_component';
import {BaseGameObject} from './models/base_game_object';
import {GameState} from './models/game_state';
import {DebugComponent} from './components/debug_component';

export class Ship extends BaseGameObject {
  public components = new ComponentGroup([
    new SpriteComponent(this, this.state, 'assets/ship.gif', {
      scale: 0.8,
    }),
    new PhysicsComponent(this),
    new WorldBoundsComponent(this, this.state.bounds),
    new DebugComponent(this),
  ]);

  constructor(private state: GameState) {
    super();
    this.p.x = 0;
    this.p.y = 0;
    this.height = 32;
    this.width = 32;
  }

  public update(deltaMs: number) {
    this.components.update(deltaMs);
  }

  public render(graphics: PIXI.Graphics) {
    this.components.render(graphics);
  }
}
