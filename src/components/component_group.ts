import {GameComponent, GameObject} from '../models/models';
import * as PIXI from 'pixi.js';

export class ComponentGroup implements GameComponent {
  private readonly components: GameComponent[] = [];

  constructor(components: GameComponent[] = []) {
    this.components = components;
  }

  update(deltaMs: number) {
    for (const component of this.components) {
      component.update(deltaMs);
    }
  }

  render(graphics: PIXI.Graphics) {
    for (const component of this.components) {
      component.render(graphics);
    }
  }

  addComponent(component: GameComponent) {
    this.components.push(component);
  }
}
