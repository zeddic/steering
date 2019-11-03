import {Region} from '../models/models';
import {Vector} from '../util/vector';
import {vectors} from '../util/vectors';
import {GameObject} from '../models/game_object';
import {TileDetails} from '../world';
import {
  regionMidX,
  regionWidth,
  regionMidY,
  regionHeight,
} from '../util/regions';

/**
 * Returns true if two regions colline based on an Axis Aligned Bounding Box check.
 */
export function regionsCollide(r1: Region, r2: Region): boolean {
  return (
    r1.left <= r2.right &&
    r1.right >= r2.left &&
    r1.top <= r2.bottom &&
    r1.bottom >= r2.top
  );
}

export function seperateGameObjects(o1: GameObject, o2: GameObject) {
  const data = getAABBCollisionDetails(o1, o2);
  applySeperationImpulse(data);
}

export function sepearteGameObjectFromTile(o1: GameObject, tile: TileDetails) {
  const data = getAABBTileCollisionDetails(o1, tile);
  if (!data) return;
  applyTileSeperationImpulse(data);
}

function getAABBCollisionDetails(
  o1: GameObject,
  o2: GameObject,
): CollisionDetails {
  const deltaX = o2.x - o1.x;
  const o1HalfWidth = o1.width / 2;
  const o2HalfWidth = o2.width / 2;
  const overlapX = o1HalfWidth + o2HalfWidth - Math.abs(deltaX);

  const deltaY = o2.y - o1.y;
  const o1HalfHeight = o1.height / 2;
  const o2HalfHeight = o2.height / 2;
  const overlapY = o1HalfHeight + o2HalfHeight - Math.abs(deltaY);

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

// todo(scott): collapse this and the above function?
// This is painful because the interface for tiles are very different
// from regular game objects. Should they be merged? I've been worried about
// the memory weight of repesenting each tile this way, but this may be premature
// optimization.
/**
 * Given an object and a tile from a tile map, determines how they are colliding
 * and what normal of the game object it should be projected to resolve the
 * collision.
 */
function getAABBTileCollisionDetails(
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
  // object that is overlapping.
  //
  // We push the object along the x or y axis which has the least
  // overlap, so that we do the minimal amount of work to fix things.
  //
  // Note that even if a tile is solid, only certain faces on the tile
  // may be solid, so we must ignore collisions that occured along that
  // face.

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
// https://gamedevelopment.tutsplus.com/tutorials/how-to-create-a-custom-2d-physics-engine-the-basics-and-impulse-resolution--gamedev-6331
function applySeperationImpulse(details: CollisionDetails) {
  const o1 = details.object1;
  const o2 = details.object2;
  const normal = details.normal;

  const relativeVelocity = vectors.subtract(o2.v, o1.v);
  const velAlongNormal = normal.dot(relativeVelocity);

  // If they are moving away from each other already, do nothing. The collision
  // will resolve itself naturally.
  if (velAlongNormal > 0) {
    return;
  }

  // TODO(scott): Add restitition to game object
  // const restition1 = 1;
  // const restition2 = 1;
  // const restition = Math.min(restition1, restition2);

  // The impule is multiplied by negative 2 because we need:
  // 1 push to negate the existing velocity
  // 1 push to start the velocity in the opposite direction
  const push = -2 * velAlongNormal;

  const o1InverseMass = o1.mass === 0 ? 0 : 1 / o1.mass;
  const o2InverseMass = o2.mass === 0 ? 0 : 1 / o2.mass;
  const totalMass = o1InverseMass + o2InverseMass;
  const o1MassShare = totalMass === 0 ? 0 : o1InverseMass / totalMass;
  const o2MassShare = totalMass === 0 ? 0 : o2InverseMass / totalMass;

  const impulse = vectors.multiplyScalar(normal, push);
  const impulse1 = vectors.multiplyScalar(impulse, o1MassShare);
  const impulse2 = vectors.multiplyScalar(impulse, o2MassShare);

  o1.v.subtract(impulse1);
  o2.v.add(impulse2);

  o1.a.clear();
  o2.a.clear();

  // TODO(scott): apply positional correction
}

/**
 * Applys an impulse (change in velocity) to a game object so it is no longer
 * overlapping a tilemap.
 */
function applyTileSeperationImpulse(details: TileCollisionDetails) {
  const o1 = details.object;
  const normal = details.normal;

  // tile is always stationary. So instead of tile.vel - obj.vel, just
  // multiple the obj velocity by -1
  const relativeVelocity = vectors.multiplyScalar(o1.v, -1);
  const velAlongNormal = normal.dot(relativeVelocity);

  // If they are moving away from each other already, do nothing. The collision
  // will resolve itself naturally.
  if (velAlongNormal > 0) {
    return;
  }

  // The impule is multiplied by negative 2 because we need:
  // 1 push to negate the existing velocity
  // 1 push to start the velocity in the opposite direction
  const push = -2 * velAlongNormal;
  const impulse = vectors.multiplyScalar(normal, push);
  o1.v.subtract(impulse);
  o1.a.clear();

  o1.p.subtract(vectors.multiplyScalar(normal, details.overlap));
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

interface TileCollisionDetails {
  object: GameObject;
  tile: TileDetails;
  normal: Vector;
  overlap: number;
}
