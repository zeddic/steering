import * as PIXI from 'pixi.js';
import {BaseGameObject} from './models/base_game_object';
import {SpriteComponent} from './components/sprite_component';
import {ComponentGroup} from './components/component_group';
import {PhysicsComponent} from './components/physics_component';
import {WorldBoundsComponent} from './components/world_bounds_component';

const app = new PIXI.Application();
document.body.appendChild(app.view);

const loader = app.loader.add('assets/ship.gif');
loader.load((loader, resources) => {
  const ship = new Ship();

  app.ticker.add(() => {
    const deltaMS = app.ticker.deltaMS;
    const delta = deltaMS / 1000;

    ship.update(delta);
  });
});

class Ship extends BaseGameObject {
  components = new ComponentGroup([
    new SpriteComponent(this, app, 'assets/ship.gif'),
    new PhysicsComponent(this),
    new WorldBoundsComponent(this, app),
  ]);

  constructor() {
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
