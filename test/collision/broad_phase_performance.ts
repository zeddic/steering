import {QuadTree} from '../../src/collision/quad_tree';
import {SpatialHash} from '../../src/collision/spatial_hash';
import {PhysicsComponent} from '../../src/components/physics_component';
import {WorldBoundsComponent} from '../../src/components/world_bounds_component';
import {BaseGameObject} from '../../src/models/base_game_object';
import {randomInt} from '../../src/util/random';

const WIDTH = 4000;
const HEIGHT = 4000;

fdescribe('Broad phase performance', () => {
  beforeEach(() => {});

  it('comparison', () => {
    const spatial = averageTime(spaitalHash, 4000);
    const quad = averageTime(quadTree, 4000);
    console.log(`Quad Tree: ${quad}ms`);
    console.log(`Spaital Hash: ${spatial}ms`);
  });

  function averageTime(
    simFn: Function,
    numObjs: number = 4000,
    numRuns: number = 5,
  ) {
    let duration = 0;
    for (let i = 0; i < numRuns; i++) {
      duration += simFn(numObjs);
    }
    const avg = Math.floor(duration / numRuns);
    return avg;
  }

  function quadTree(numObjects: number) {
    const tree = new QuadTree({
      region: {
        top: 0,
        left: 0,
        right: WIDTH,
        bottom: HEIGHT,
      },
      maxDepth: 7,
      maxNodePop: 4,
    });

    const objects = createObjects(numObjects);
    for (const o of objects) {
      tree.add(o);
    }

    const start = performance.now();

    for (let i = 0; i < 300; i++) {
      for (const o of objects) {
        o.update(0.016);
        tree.move(o);
      }
      tree.cleanup();

      for (const o of objects) {
        tree.query(o);
      }
    }
    const end = performance.now();
    const duration = end - start;
    return duration;
  }

  function spaitalHash(numObjects: number) {
    const spatialHash = new SpatialHash({
      gridSize: 128,
    });

    const objects = createObjects(numObjects);
    for (const o of objects) {
      spatialHash.add(o);
    }

    const start = performance.now();

    for (let i = 0; i < 300; i++) {
      for (const o of objects) {
        o.update(0.016);
        spatialHash.move(o);
      }

      for (const o of objects) {
        spatialHash.query(o);
      }

      spatialHash.cleanup();
    }

    const end = performance.now();
    const duration = end - start;
    return duration;
  }

  function createObjects(num: number) {
    const objects: TestObject[] = [];
    for (let i = 0; i < num; i++) {
      const o = new TestObject(randomInt(0, WIDTH), randomInt(0, HEIGHT));
      objects.push(o);
    }
    return objects;
  }
});

class TestObject extends BaseGameObject {
  readonly physics: PhysicsComponent = new PhysicsComponent(this);
  readonly bounds = new WorldBoundsComponent(this, {
    top: 0,
    left: 0,
    right: WIDTH,
    bottom: HEIGHT,
  });
  constructor(x: number, y: number, width = 32, height = 32) {
    super();
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;
    this.v.x = randomInt(-70, 70);
    this.v.y = randomInt(-70, 70);
  }

  update(deltaMs: number) {
    this.physics.update(deltaMs);
    this.bounds.update(deltaMs);
  }
}
