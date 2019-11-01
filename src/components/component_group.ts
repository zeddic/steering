import * as PIXI from 'pixi.js';
import {GameComponent, GameObject} from '../models/models';

export class ComponentGroup implements GameComponent {
  private readonly components: GameComponent[] = [];

  constructor(components: GameComponent[] = []) {
    this.components = components;
  }

  public update(deltaMs: number) {
    for (const component of this.components) {
      component.update(deltaMs);
    }
  }

  public render(graphics: PIXI.Graphics) {
    for (const component of this.components) {
      component.render(graphics);
    }
  }

  public addComponent(component: GameComponent) {
    this.components.push(component);
  }
}
