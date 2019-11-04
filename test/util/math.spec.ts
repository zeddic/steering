import {getClosestExponentOfTwo} from '../../src/util/math';

describe('Math Utils', () => {
  describe('exponents of 2', () => {
    it('can get power of two for a number', () => {
      expect(getClosestExponentOfTwo(2)).toEqual(1);
      expect(getClosestExponentOfTwo(4)).toEqual(2);
      expect(getClosestExponentOfTwo(8)).toEqual(3);
      expect(getClosestExponentOfTwo(16)).toEqual(4);
      expect(getClosestExponentOfTwo(32)).toEqual(5);
      expect(getClosestExponentOfTwo(64)).toEqual(6);
    });

    it('can get power of two for non-2 numbers', () => {
      expect(getClosestExponentOfTwo(30)).toEqual(4);
      // 32 -> 5
      expect(getClosestExponentOfTwo(33)).toEqual(5);
      expect(getClosestExponentOfTwo(50)).toEqual(5);
      expect(getClosestExponentOfTwo(63)).toEqual(5);
      // 64 -> 6
      expect(getClosestExponentOfTwo(65)).toEqual(6);
    });
  });
});
