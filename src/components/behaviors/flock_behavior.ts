import {GameComponent} from '../../models/models';
import {GameObject} from '../../models/game_object';
import {Steering} from './steering';
import {Vector} from '../../util/vector';
import {GameState} from '../../models/game_state';
import {lookAtVelocity} from '../../util/game_objects';

export class FlockBehavior implements GameComponent {
  steering = new Steering({entity: this.object});

  constructor(private readonly object: GameObject, private readonly state: GameState) {}

  public update(delta: number) {
    const force = this.steering.wander({
      distance: 5,
      radius: 50,
      change: 1,
    });

    this.object.a = force; // this.steering.seek(this.state.input.mouse);

    lookAtVelocity(this.object);

    // const obj = this.object;
    // // Euler implicit integration
    // // Update velocity
    // obj.v.x += obj.a.x * delta;
    // obj.v.y += obj.a.y * delta;
    // // Update position
    // obj.p.x += obj.v.x * delta;
    // obj.p.y += obj.v.y * delta;
  }

  public render() {}
}
