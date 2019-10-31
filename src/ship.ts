import {BaseGameObject} from './models/base_game_object';
import {ComponentGroup} from './components/component_group';
import {SpriteComponent} from './components/sprite_component';
import {PhysicsComponent} from './components/physics_component';
import {WorldBoundsComponent} from './components/world_bounds_component';
import {DebugComponent} from './components/debug_component';

let idGen = 0;
export class Ship extends BaseGameObject {
  components = new ComponentGroup([
    new SpriteComponent(this, this.app, 'assets/ship.gif', {scale: 0.25}),
    new PhysicsComponent(this),
    new WorldBoundsComponent(this, appRegion(this.app)),
    // new DebugComponent(this),
  ]);
  id = idGen++;

  constructor(private readonly app: PIXI.Application) {
    super();
    this.p.x = app.view.width / 2;
    this.p.y = app.view.height / 2;
    this.height = 10;
    this.width = 10;
  }

  update(deltaMs: number) {
    // this.rotation += deltaMs * 90;
    this.components.update(deltaMs);
  }

  render(graphics: PIXI.Graphics) {
    this.components.render(graphics);
  }
}

function appRegion(app: PIXI.Application) {
  return {left: 0, top: 0, right: app.view.width, bottom: app.view.height};
}
