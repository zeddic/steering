import {QuadTree} from '../../src/collision/quad_tree';
import {BaseGameObject} from '../../src/models/base_game_object';
import {PhysicsComponent} from '../../src/components/physics_component';
import {randomInt} from '../../src/util/random';
import {GameObject} from '../../src/models/models';
import {WorldBoundsComponent} from '../../src/components/world_bounds_component';

xdescribe('Broad phase performance', () => {
  const width = 2000;
  const height = 2000;

  beforeEach(() => {});

  it('can be queried', () => {
    const avg1 = averageTime(classicSimulation);
    console.log(`Original: ${avg1}ms`);
  });

  function averageTime(simFn: Function, numRuns: number = 20) {
    let duration = 0;
    for (let i = 0; i < numRuns; i++) {
      duration += simFn();
    }
    const avg = Math.floor(duration / numRuns);
    return avg;
  }

  function classicSimulation() {
    const tree = new QuadTree({
      region: {
        top: 0,
        left: 0,
        right: width,
        bottom: height,
      },
      maxDepth: 10,
      maxNodePop: 4,
    });

    const objects: TestObject[] = [];
    for (let i = 0; i < 8000; i++) {
      const o = new TestObject(randomInt(0, width), randomInt(0, height));
      objects.push(o);
      tree.add(o);
    }

    const start = performance.now();

    for (let i = 0; i < 1000; i++) {
      for (const o of objects) {
        o.update(0.016);
        tree.move(o);
      }
      tree.cleanup();
    }
    const end = performance.now();
    const duration = end - start;
    return duration;
  }
});

class TestObject extends BaseGameObject {
  readonly physics: PhysicsComponent = new PhysicsComponent(this);

  constructor(x: number, y: number, width = 64, height = 64) {
    super();
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;
    this.v.x = randomInt(-30, 30);
    this.v.y = randomInt(-30, 30);
  }

  update(deltaMs: number) {
    this.physics.update(deltaMs);
  }
}
