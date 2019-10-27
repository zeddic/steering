import {runInThisContext} from 'vm';

/**
 * A 2D Vector.
 */
export class Vector {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(other: Vector) {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  subtract(other: Vector) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  multiplyScalar(amount: number) {
    this.x *= amount;
    this.y *= amount;
    return this;
  }

  dot(other: Vector) {
    return this.x * other.x + this.y * other.y;
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  clear() {
    this.x = 0;
    this.y = 0;
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
