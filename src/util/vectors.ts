import {Vector} from './vector';

function add(v1: Vector, v2: Vector): Vector {
  return v1.copy().add(v2);
}

function subtract(v1: Vector, v2: Vector): Vector {
  return v1.copy().subtract(v2);
}

function multiplyScalar(v1: Vector, amount: number) {
  return v1.copy().multiply(amount);
}

function withinDistance(v1: Vector, v2: Vector, distance: number): boolean {
  const dX = v1.x - v2.x;
  const dY = v1.y - v2.y;
  return dX * dX + dY * dY < distance * distance;
}

export const vectors = {
  add,
  subtract,
  multiplyScalar,
  withinDistance,
};
