import {Vector} from '../../util/vector';
import {GameObject} from '../../models/game_object';
import {vectors} from '../../util/vectors';
import {randomValue} from '../../util/random';

const DEFAULT_MAX_SPEED = 4;
const DEFAULT_MAX_FORCE = 0.05;

export class Steering {
  private entity: GameObject;

  private wanderRad = randomValue(0, Math.PI * 2);

  private WANDER_CIRCLE_DISTANCE: number;
  private WANDER_CIRCLE_RADIUS: number;
  private WANDER_RADIUS_CHANGE = 1;

  constructor(options: {entity: GameObject}) {
    this.entity = options.entity;
    this.WANDER_CIRCLE_DISTANCE = this.entity.maxSpeed ?? DEFAULT_MAX_SPEED;
    this.WANDER_CIRCLE_RADIUS = this.entity.maxSpeed ?? DEFAULT_MAX_SPEED;
  }

  seek(target: Vector): Vector {
    let desiredVelocity = vectors.subtract(target, this.entity.p);

    if (this.entity.maxSpeed !== undefined) {
      desiredVelocity.normalize().multiply(this.entity.maxSpeed);
    }

    return desiredVelocity.subtract(this.entity.v);
  }

  arrive(target: Vector, range: number, offset: number) {
    offset = offset || 0;

    var desired = vectors.subtract(target, this.entity.p);
    var len2 = desired.lengthSq();

    if (this.entity.maxSpeed) {
      desired.normalize().multiply(this.entity.maxSpeed);
    }

    if (len2 < range * range) {
      var distance = Math.sqrt(len2);
      var scale = (distance - offset) / (range - offset);
      scale = Math.floor(scale);
      desired.multiply(Math.max(0, scale));
    }

    desired.subtract(this.entity.v);
    return desired;
  }

  pursue(target: GameObject): Vector {
    return this.seek(this.getEstimatedTargetPosition(target));
  }

  evade(target: GameObject): Vector {
    return this.pursue(target).invert();
  }

  gravitate(target: Vector, mass: number) {
    const desired = vectors.subtract(target, this.entity.p);
    const len2 = desired.lengthSq();
    const pull = (100 * mass) / len2;
    desired.normalize().multiply(pull);
    return desired;
  }

  wander(
    options: {
      distance?: number;
      radius?: number;
      change?: number;
    } = {},
  ) {
    const entity = this.entity;
    const distance = options.distance ?? this.entity.maxSpeed ?? DEFAULT_MAX_SPEED;
    const radius = options.radius ?? this.entity.maxSpeed ?? DEFAULT_MAX_SPEED;
    const change = options.change ?? 1;

    const desired = entity.v.isZero()
      ? Vector.fromRad(entity.rotation)
      : entity.v.copy().normalize();

    this.wanderRad += randomValue(-change / 2, change / 2);
    const displacement = Vector.fromRad(this.wanderRad).multiply(radius);
    desired.multiply(distance).add(displacement);

    return desired;
  }

  /**
   * Returns a normalized vector pointing away from neighbors.
   */
  seperation(others: GameObject[], range?: number) {
    var entity = this.entity;
    var desired = new Vector(0, 0);
    var count = 0;

    for (let other of others) {
      if (range !== undefined && !this.inRangeOf(other, range)) {
        continue;
      }

      desired.x += other.x - entity.x;
      desired.y += other.y - entity.y;
      count++;
    }

    if (count == 0) {
      return desired;
    }

    desired.divideScalar(count);
    desired.invert().normalize();
    return desired;
  }

  /**
   * Returns a normalized vector pointing in the average velocity of other objects.
   */
  alignment(others: GameObject[], range?: number) {
    var desired = new Vector(0, 0);
    var count = 0;

    for (let other of others) {
      if (range !== undefined && !this.inRangeOf(other, range)) {
        continue;
      }

      desired.x += other.v.x;
      desired.y += other.v.y;
      count++;
    }

    if (count == 0) {
      return desired;
    }

    desired.divideScalar(count);
    desired.normalize();
    return desired;
  }

  /**
   * Returns a normalized vector pointing towards the center point of a group of objects.
   */
  cohesion(others: GameObject[], range?: number) {
    var center = new Vector(0, 0);
    var count = 0;

    for (let other of others) {
      if (range !== undefined && !this.inRangeOf(other, range)) {
        continue;
      }

      center.x += other.x;
      center.y += other.y;
      count++;
    }

    if (count == 0) {
      return center;
    }

    center.divideScalar(count);

    var desired = vectors.subtract(center, this.entity.p);
    desired.normalize();
    return desired;
  }

  // get maxSpeed() {
  //   return this.entity.maxSpeed ?? DEFAULT_MAX_SPEED;
  // }

  /**
   * Given a target, returns a vector that represents the position to where the target is GOING to be.
   */
  private getEstimatedTargetPosition(target: GameObject) {
    const entity = this.entity;
    const maxTicks = 60;

    // Determine how many ticks to look into the future.
    // If we are about to reach the target, we look forward fewer tickers.
    const distance = vectors.subtract(target.p, entity.p).length();
    let ticks = entity.v.isZero() ? 1 : distance / entity.v.length();
    ticks = Math.min(maxTicks, ticks);

    const leadAmount = target.v.copy().multiply(ticks);
    const estimatedPosition = target.p.copy().add(leadAmount);
    return estimatedPosition;
  }

  private inRangeOf(target: GameObject, range: number) {
    var p1 = this.entity.p;
    var p2 = target.p;
    var dX = p1.x - p2.x;
    var dY = p1.y - p2.y;
    return dX * dX + dY * dY < range * range;
  }
}
