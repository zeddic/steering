import {GameObject, INFINITE_MASS} from '../models/game_object';
import {Region} from '../models/models';
import {TileDetails} from '../tile_map';
import {regionHeight, regionMidX, regionMidY, regionWidth} from '../util/regions';
import {Vector} from '../util/vector';
import {vectors} from '../util/vectors';

/**
 * Returns true if two regions colline based on an Axis Aligned Bounding Box check.
 */
export function regionsCollide(r1: Region, r2: Region): boolean {
  return r1.left <= r2.right && r1.right >= r2.left && r1.top <= r2.bottom && r1.bottom >= r2.top;
}

// TODO(scott): There is a decent amount of overlap beteween the object vs object code
// and the object vs tile code. Is there a nice way to collapse these?
// This is split right now because tiles don't implement the GameObject interface and
// they need some additional logic to handle the fact that not all faces on tiles
// are solid.

/**
 * Resolves a collision between two game objects.
 */
export function seperateGameObjects(o1: GameObject, o2: GameObject) {
  const data = getObjectVsObjectCollisionDetails(o1, o2);
  resolveObjectVsObject(data);
}

/**
 * Resolves a collision between a game object and a tile.
 */
export function sepearteGameObjectFromTile(o1: GameObject, tile: TileDetails) {
  const data = getObjectVsTileCollisionDetails(o1, tile);
  if (!data) return;
  resolveObjectVsTile(data);
}

/**
 * Given two objects in the world, determines how they are colliding and what normal
 * of the first game object it should be projected to resolve the collision.
 */
function getObjectVsObjectCollisionDetails(o1: GameObject, o2: GameObject): CollisionDetails {
  const deltaX = o2.x - o1.x;
  const o1HalfWidth = o1.width / 2;
  const o2HalfWidth = o2.width / 2;
  const overlapX = o1HalfWidth + o2HalfWidth - Math.abs(deltaX);

  const deltaY = o2.y - o1.y;
  const o1HalfHeight = o1.height / 2;
  const o2HalfHeight = o2.height / 2;
  const overlapY = o1HalfHeight + o2HalfHeight - Math.abs(deltaY);

  // We only correct along one axis of overlap at a time.
  // We pick the axis that has the least amount of overlap so that
  // we need to do the least amount of work neccessary to fix things.

  if (overlapX < overlapY) {
    const normal = deltaX > 0 ? new Vector(1, 0) : new Vector(-1, 0);
    return {
      normal,
      overlap: overlapX,
      object1: o1,
      object2: o2,
    };
  } else {
    const normal = deltaY > 0 ? new Vector(0, 1) : new Vector(0, -1);
    return {
      normal,
      overlap: overlapY,
      object1: o1,
      object2: o2,
    };
  }
}

/**
 * Given an object and a tile from a tile map, determines how they are colliding
 * and what normal of the game object it should be projected to resolve the
 * collision.
 */
function getObjectVsTileCollisionDetails(
  o1: GameObject,
  o2: TileDetails,
): TileCollisionDetails | undefined {
  const deltaX = regionMidX(o2.region) - o1.x;
  const o1HalfWidth = o1.width / 2;
  const o2HalfWidth = regionWidth(o2.region) / 2;
  const overlapX = o1HalfWidth + o2HalfWidth - Math.abs(deltaX);

  const deltaY = regionMidY(o2.region) - o1.y;
  const o1HalfHeight = o1.height / 2;
  const o2HalfHeight = regionHeight(o2.region) / 2;
  const overlapY = o1HalfHeight + o2HalfHeight - Math.abs(deltaY);

  let minOverlapSeen = Number.MAX_VALUE;
  let normal: Vector | undefined;

  // We need to determine which direction to push the object so it
  // is no longer overlapping the tile. This is represented by a
  // normal vector which should point outward on the face of the
  // object that is colliding.
  //
  // We push the object along either x or y axis: which ever has the least
  // overlap, so that we do the minimal amount of work to fix things.
  //
  // Note that even if a tile is solid, only certain faces on the tile
  // may be solid and are considered in this resolution step. This is done
  // when solid tiles are continguous to each other: there is no point
  // in applying collision detection on face's that the user should never
  // be able to reach, and doing so can result in unexpected resolutions
  // when face objects on tile corners.

  // Tile to right of object & tile's west face is solid.
  if (deltaX > 0 && o2.solidFaces.w && overlapX < minOverlapSeen) {
    normal = new Vector(1, 0); // objects right face is the normal
    minOverlapSeen = overlapX;
  }

  // Tile to left of object & tiles east face is solid.
  if (deltaX < 0 && o2.solidFaces.e && overlapX < minOverlapSeen) {
    normal = new Vector(-1, 0); // object left face is the normal
    minOverlapSeen = overlapX;
  }

  // Tile below object & tiles north face is solid.
  if (deltaY > 0 && o2.solidFaces.n && overlapY < minOverlapSeen) {
    normal = new Vector(0, 1); // objects bottom face is the normal
    minOverlapSeen = overlapY;
  }

  // Tile above object & tiles south face is solid
  if (deltaY < 0 && o2.solidFaces.s && overlapY < minOverlapSeen) {
    normal = new Vector(0, -1); // objects top face is the normal
    minOverlapSeen = overlapY;
  }

  // Object had no solid faces?
  if (!normal) {
    return undefined;
  }

  return {
    normal,
    object: o1,
    tile: o2,
    overlap: minOverlapSeen,
  };
}

/**
 * Given details about a collision between two objects, modifies their properties to
 * correct the overlap. This is done in a couple of ways:
 *
 * 1: The velocity along the surface of collision is reversed and distributed based
 *    on mass. This results in them 'bouncing' apart.
 *
 * 2: Each objects position is modified by the minimal amount neccessary along the
 *    collision normal so that they are no longer overlapping.
 */
function resolveObjectVsObject(details: CollisionDetails) {
  const o1 = details.object1;
  const o2 = details.object2;
  const normal = details.normal;

  const relativeVelocity = vectors.subtract(o2.v, o1.v);
  const velAlongNormal = normal.dot(relativeVelocity);

  // We will apply collision response proportional to each object's inverse mass.
  // That is, the lighter an object is in comparison to the object it
  // collided with, the greater the energy and positional correction that
  // will be applied to it. Note that some objects are 'static' and may may
  // be considered to have 'infinite mass'. These objects never get any of
  // the correction applied to them.
  const massShares = getObjectsPercentOfTotalInverseMass(o1, o2);

  // UPDATE ACCELERATION
  o1.a.clear();
  o2.a.clear();

  // UPDATE VELOCITY

  // If they are moving away from each other already, don't bounce
  if (velAlongNormal < 0) {
    // TODO(scott): Add restitition to game object. Right now velocity is
    // never lost - it just gets reversed. With restition, we will be able
    // to control much much energy is lost in the act of bouncing. This
    // would allow us to have bouncy things (eg a rubber ball) and spongy
    // things (eg grass).
    const restition1 = 1;
    const restition2 = 0.4;
    const restition = Math.min(restition1, restition2);

    // The velocity is multiplied by negative 2 because we need:
    // 1x to negate the existing velocity
    // 1x to start the velocity in the opposite direction
    const velocityPush = -2 * velAlongNormal;
    const deltaV = vectors.multiplyScalar(normal, velocityPush); //.multiply(restition);
    const deltaV1 = vectors.multiplyScalar(deltaV, massShares.mass1Percent);
    const deltaV2 = vectors.multiplyScalar(deltaV, massShares.mass2Percent);
    o1.v.subtract(deltaV1);
    o2.v.add(deltaV2);
    return;
  }

  // UPDATE POSITION
  const deltaP = vectors.multiplyScalar(normal, details.overlap);
  const deltaP1 = vectors.multiplyScalar(deltaP, massShares.mass1Percent);
  const deltaP2 = vectors.multiplyScalar(deltaP, massShares.mass2Percent);
  o1.p.subtract(deltaP1);
  o2.p.add(deltaP2);
}

/**
 * Given details about an object colliding with a tile, modifies the object's
 * properties to correct the overlap. This is very similar to object
 * vs object collision, except tiles are assumed to always have infite mass.
 * As a result, all changes are applied to the object.
 */
function resolveObjectVsTile(details: TileCollisionDetails) {
  const o1 = details.object;
  const normal = details.normal;

  // Tile is always stationary. So instead of tile.vel - obj.vel, just
  // multiply the obj velocity by -1
  const relativeVelocity = vectors.multiplyScalar(o1.v, -1);
  const velAlongNormal = normal.dot(relativeVelocity);

  // ACCELERATION
  o1.a.clear();

  // VELOCITY
  // If they are moving away from each other already, don't bounce
  if (velAlongNormal < 0) {
    // The velocity is multiplied by negative 2 because we need:
    // 1x to negate the existing velocity
    // 1x to start the velocity in the opposite direction
    const velocityPush = -2 * velAlongNormal;
    const deltaV = vectors.multiplyScalar(normal, velocityPush);
    o1.v.subtract(deltaV);
  }

  // POSITION
  const deltaP = vectors.multiplyScalar(normal, details.overlap);
  o1.p.subtract(deltaP);
}

/**
 * Contains information describing an object vs object collsion.
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
   * A normalized vector identifying the line upon which the overlap is occuring
   * relative to object1. For example, <x: 1, y:0> would mean that object1 is
   * overlapping object2 on object1's right hand face.
   */
  normal: Vector;

  /**
   * The amount that the objects are overlapping along the normal.
   */
  overlap: number;
}

/**
 * Contains information describing and object vs tile collision.
 */
interface TileCollisionDetails {
  /**
   * The object involved.
   */
  object: GameObject;

  /**
   * The tile that was hit.
   */
  tile: TileDetails;

  /**
   * A normalized vectory identifying the line upon which the overlap
   * is occuring relative to the object. For example, <x:1, y:0> would mean
   * that the object is overlapping the tile on the objects right hand surface.
   */
  normal: Vector;

  /**
   * The amount that the objects are overlapping along the normal.
   */
  overlap: number;
}

// UTILITY

/**
 * Given two objects return each objects's percentage share of the total
 * inverse mass.
 */
function getObjectsPercentOfTotalInverseMass(o1: GameObject, o2: GameObject) {
  return getPercentOfTotalInverseMass(o1.mass, o2.mass);
}

/**
 * Given two masses return each mass's percentage share (0 to 1 ) of the total
 * inverse mass. This gives a greater percentage share to the smaller masses
 * and may be used to give more correctional forces to them.
 *
 * For example:
 *
 * 2 & 10
 *
 * total = (1/2 + 1/10)
 * 2's share = (1/2) / total = ~.83
 * 10's share = (1/10) / total = ~.16
 */
function getPercentOfTotalInverseMass(
  obj1Mass: number,
  obj2Mass: number,
): {mass1Percent: number; mass2Percent: number} {
  const o1InverseMass = obj1Mass === INFINITE_MASS ? 0 : 1 / obj1Mass;
  const o2InverseMass = obj2Mass === INFINITE_MASS ? 0 : 1 / obj2Mass;
  const totalMass = o1InverseMass + o2InverseMass;
  const mass1Percent = totalMass === 0 ? 0 : o1InverseMass / totalMass;
  const mass2Percent = totalMass === 0 ? 0 : o2InverseMass / totalMass;
  return {mass1Percent, mass2Percent};
}
