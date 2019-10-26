import {GameComponent, GameObject} from '../models/models';

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

  render() {
    for (const component of this.components) {
      component.render();
    }
  }

  addComponent(component: GameComponent) {
    this.components.push(component);
  }
}
