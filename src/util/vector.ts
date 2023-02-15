import {runInThisContext} from 'vm';

/**
 * A 2D Vector.
 */
export class Vector {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(other: Vector) {
    this.x += other.x;
    this.y += other.y;
    return this;
  }

  addValues(x: number, y: number) {
    this.x += x;
    this.y += y;
    return this;
  }

  subtract(other: Vector) {
    this.x -= other.x;
    this.y -= other.y;
    return this;
  }

  multiply(amount: number) {
    this.x *= amount;
    this.y *= amount;
    return this;
  }

  truncate(max: number) {
    if (this.lengthSq() > max * max) {
      this.normalize().multiply(max);
    }

    return this;
  }

  invert() {
    this.x *= -1;
    this.y *= -1;
    return this;
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
    return this;
  }

  normalize() {
    return this.divideScalar(this.length());
  }

  divideScalar(s: number) {
    if (s === 0) {
      this.x = 0;
      this.y = 0;
    } else {
      var invScalar = 1 / s;
      this.x *= invScalar;
      this.y *= invScalar;
    }
    return this;
  }

  clear() {
    this.x = 0;
    this.y = 0;
    return this;
  }

  dot(other: Vector) {
    return this.x * other.x + this.y * other.y;
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }

  isZero() {
    return this.x === 0 && this.y === 0;
  }

  rad() {
    //return Math.atan2(this.x, this.y);
    return Math.atan2(this.y, this.x);
  }

  deg() {
    return (this.rad() * 180) / Math.PI;
  }

  copy() {
    return new Vector(this.x, this.y);
  }

  static fromRad(rad: number, length?: number): Vector {
    length = length ?? 1;
    const x = length * Math.cos(rad);
    const y = length * Math.sin(rad);
    return new Vector(x, y);
  }
}
