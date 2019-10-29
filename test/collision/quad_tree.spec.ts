import {QuadTree} from '../../src/collision/quad_tree';

describe('Quad Tree', () => {
  it('can be created', () => {
    const tree = new QuadTree({
      top: 0,
      left: 0,
      right: 800,
      bottom: 800,
    });

    expect(tree).toBeDefined();
  });
});
