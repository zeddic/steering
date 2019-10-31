import {BaseGameObject} from '../../src/models/base_game_object';
import {PhysicsComponent} from '../../src/components/physics_component';
import {QuadTree} from '../../src/collision/quad_tree';

describe('Quad Tree', () => {
  let tree: QuadTree;

  describe('basic operations', () => {
    beforeEach(() => {
      tree = new QuadTree({
        region: {
          top: 0,
          left: 0,
          right: 800,
          bottom: 800,
        },
        maxDepth: 10,
        maxNodePop: 1,
      });
    });

    it('can be queried', () => {
      const o1 = new TestObject(200, 200);
      const o2 = new TestObject(260, 260);
      const o3 = new TestObject(600, 600);

      tree.add(o1);
      tree.add(o2);
      tree.add(o3);
      let result = tree.query(region(100, 100, 300, 300));
      expect(result).toEqual([o1, o2]);
      result = tree.query(region(600, 600, 610, 610));
      expect(result).toEqual([o3]);
    });
  });
});

function region(left: number, top: number, right: number, bottom: number) {
  return {top, left, right, bottom};
}
export class TestObject extends BaseGameObject {
  readonly physics: PhysicsComponent = new PhysicsComponent(this);

  constructor(x: number, y: number, width = 64, height = 64) {
    super();
    this.height = height;
    this.width = width;
    this.x = x;
    this.y = y;
  }

  update(deltaMs: number) {
    this.physics.update(deltaMs);
  }
}
