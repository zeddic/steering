import {GameComponent} from '../../models/models';
import {GameObject} from '../../models/game_object';
import {Steering} from './steering';
import {Vector} from '../../util/vector';
import {GameState} from '../../models/game_state';
import {lookAtVelocity} from '../../util/game_objects';
import {Interval} from '../../util/interval';
import {Finder} from '../../util/finder';

export class FlockBehavior implements GameComponent {
  steering = new Steering({entity: this.object});
  iFindOthers = new Interval(2, true);
  finder = new Finder(this.object, this.state.world);
  friends: GameObject[] = [];

  hunter: GameObject[] = [];

  // force = new Vector(0, 0);

  constructor(private readonly object: GameObject, private readonly state: GameState) {}

  public update(delta: number) {
    if (this.iFindOthers.update(delta)) {
      this.friends = this.finder.findOtherWithType(140, 'small');
      this.hunter = this.finder.findOtherWithType(400, 'big');
    }

    const force = this.object.a;
    const steer = this.steering;

    force.set(0, 0);
    force.add(
      steer.wander({
        // distance: 5,
        // radius: 50,
        // change: 1,
      }),
    );
    // force.add(steer.home(this.home, 1000).scale(4));
    force.add(steer.seperation(this.friends, 20).multiply(10));
    force.add(steer.alignment(this.friends, 140).multiply(100));
    force.add(steer.cohesion(this.friends, 100).multiply(60));
    force.add(steer.seperation(this.hunter, 400).multiply(600));
    // force.add(steer.seperation(this.hunter, 300).scale(15));

    // this.object.a = force; // this.steering.seek(this.state.input.mouse);

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
