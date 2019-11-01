import {getPowerOfTwo, SpatialHash} from '../../src/collision/spatial_hash';

describe('Spatial Hash', () => {
  it('can get power of two for a number', () => {
    expect(getPowerOfTwo(2)).toEqual(1);
    expect(getPowerOfTwo(4)).toEqual(2);
    expect(getPowerOfTwo(8)).toEqual(3);
    expect(getPowerOfTwo(16)).toEqual(4);
    expect(getPowerOfTwo(32)).toEqual(5);
    expect(getPowerOfTwo(64)).toEqual(6);
  });

  it('can get power of two for non-2 numbers', () => {
    expect(getPowerOfTwo(30)).toEqual(4);
    // 32 -> 5
    expect(getPowerOfTwo(33)).toEqual(5);
    expect(getPowerOfTwo(50)).toEqual(5);
    expect(getPowerOfTwo(63)).toEqual(5);
    // 64 -> 6
    expect(getPowerOfTwo(65)).toEqual(6);
  });
});

function region(left: number, top: number, right: number, bottom: number) {
  return {top, left, right, bottom};
}
