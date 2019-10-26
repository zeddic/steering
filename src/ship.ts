import {BaseGameObject} from './models/base_game_object';
import {ComponentGroup} from './components/component_group';
import {SpriteComponent} from './components/sprite_component';
import {PhysicsComponent} from './components/physics_component';
import {WorldBoundsComponent} from './components/world_bounds_component';

export class Ship extends BaseGameObject {
  components = new ComponentGroup([
    new SpriteComponent(this, this.app, 'assets/ship.gif'),
    new PhysicsComponent(this),
    new WorldBoundsComponent(this, this.app),
  ]);

  constructor(private readonly app: PIXI.Application) {
    super();
    this.p.x = app.view.width / 2;
    this.p.y = app.view.height / 2;

    this.v.x = 50;
    this.v.y = 50;
  }

  update(deltaMs: number) {
    this.rotation += deltaMs * 90;
    this.components.update(deltaMs);
  }

  render() {
    this.components.render();
  }
}
