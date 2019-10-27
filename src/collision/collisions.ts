import {Region, GameObject} from '../models/models';
import {Vector} from '../util/vector';
import {vectors} from '../util/vectors';

/**
 * Returns true if two regions colline based on an Axis Aligned Bounding Box check.
 */
export function regionsCollide(r1: Region, r2: Region): boolean {
  return (
    r1.left < r2.right &&
    r1.right > r2.left &&
    r1.top < r2.top &&
    r1.bottom > r2.top
  );
}

export function seperateGameObjects(o1: GameObject, o2: GameObject) {
  const collisionDetails = getAABBCollisionDetails(o1, o2);
  applySeperationImpulse(collisionDetails);
}

function getAABBCollisionDetails(
  o1: GameObject,
  o2: GameObject,
): CollisionDetails {
  const deltaX = o2.x - o1.x;
  const o1HalfWidth = o1.right - o1.left;
  const o2HalfWidth = o2.right - o2.left;
  const overlapX = o1HalfWidth + o2HalfWidth - deltaX;

  const deltaY = o2.y - o1.y;
  const o1HalfHeight = o1.bottom - o1.top;
  const o2HalfHeight = o2.bottom - o2.top;
  const overlapY = o1HalfHeight + o2HalfHeight - deltaY;

  if (overlapX > overlapY) {
    const normal = deltaX > 0 ? new Vector(1, 0) : new Vector(-1, 0);
    return {
      normal,
      overlap: deltaX,
      object1: o1,
      object2: o2,
    };
  } else {
    const normal = deltaY > 0 ? new Vector(0, 1) : new Vector(0, -1);
    return {
      normal,
      overlap: deltaY,
      object1: o1,
      object2: o2,
    };
  }
}

// https://gamedevelopment.tutsplus.com/tutorials/how-to-create-a-custom-2d-physics-engine-the-basics-and-impulse-resolution--gamedev-6331
function applySeperationImpulse(details: CollisionDetails) {
  const o1 = details.object1;
  const o2 = details.object2;
  const normal = details.normal;

  const relativeVelocity = vectors.subtract(o2.v, o1.v);
  const velAlongNormal = normal.dot(relativeVelocity);

  // // TODO(baileys): Add restitition to game object
  // const restition1 = 1;
  // const restition2 = 1;
  // const restition = Math.min(restition1, restition2);

  const push = -2 * velAlongNormal;

  const o1InverseMass = o1.mass === 0 ? 0 : 1 / o1.mass;
  const o2InverseMass = o2.mass === 0 ? 0 : 1 / o2.mass;
  const totalMass = o1InverseMass + o2InverseMass;
  const o1MassShare = totalMass === 0 ? 0 : o1InverseMass / totalMass;
  const o2MassShare = totalMass === 0 ? 0 : o2InverseMass / totalMass;

  // push = push / (1 / o1.mass + 1 / o2.mass);

  const impulse = vectors.multiplyScalar(normal, push);
  const impulse1 = vectors.multiplyScalar(impulse, o1MassShare);
  const impulse2 = vectors.multiplyScalar(impulse, o2MassShare);

  o1.v.subtract(impulse1);
  o2.v.add(impulse2);

  o1.a.clear();
  o2.a.clear();
}

/**
 * Contains information describing the collision.
 */
interface CollisionDetails {
  /**
   * The first object in the collision.
   */
  object1: GameObject;

  /**
   * The second object in the collision.
   */
  object2: GameObject;

  /**
   * The amount that the objects are overlapping along the normal.
   */
  overlap: number;

  /**
   * A normalized vector identifying the line upon which the overlap is occuring.
   * For example, <x: 1, y:0> would mean that object1 is overlapping object2 on the
   * right hand side.
   */
  normal: Vector;
}
