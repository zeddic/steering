import {GameComponent} from '../models/models';
import {GameObject} from '../models/game_object';

export class PhysicsComponent implements GameComponent {
  constructor(private readonly object: GameObject) {}

  public update(delta: number) {
    const obj = this.object;

    // Euler implicit integration

    // Update velocity
    obj.v.x += obj.a.x * delta;
    obj.v.y += obj.a.y * delta;

    // Update position
    obj.p.x += obj.v.x * delta;
    obj.p.y += obj.v.y * delta;
  }

  public render() {}
}
