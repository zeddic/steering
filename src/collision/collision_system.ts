import {Region} from '../models/models';
import {QuadTree} from './quad_tree';
import {SpatialHash} from './spatial_hash';
import * as PIXI from 'pixi.js';
import {regionsCollide, seperateGameObjects, sepearteGameObjectFromTile} from './collisions';
import {World} from '../world';
import {GameObject} from '../models/game_object';
import {Vector} from '../util/vector';
import {vectors} from '../util/vectors';

/**
 * Keeps track of the objects in the game world and resolves collisions.
 * May also be used to query the world for objects within a range.
 */
export class CollisionSystem {
  quadTree: QuadTree;
  spatialHash: SpatialHash;
  all = new Set<GameObject>();

  constructor(private readonly bounds: Region) {
    this.quadTree = new QuadTree({
      region: bounds,
      maxDepth: 7,
      maxNodePop: 4,
    });

    this.spatialHash = new SpatialHash({gridSize: 128});
  }

  add(o: GameObject) {
    this.spatialHash.add(o);
    this.all.add(o);
  }

  addAll(objects: GameObject[]) {
    for (const o of objects) {
      this.add(o);
    }
  }

  remove(o: GameObject) {
    this.spatialHash.remove(o);
    this.all.delete(o);
  }

  removeAll(objects: GameObject[]) {
    for (const o of objects) {
      this.remove(o);
    }
  }

  move(o: GameObject) {
    this.spatialHash.move(o);
  }

  moveAll(objects: GameObject[]) {
    for (const o of objects) {
      this.move(o);
    }
  }

  resolveCollisions() {
    for (const object of this.all.values()) {
      const others = this.query(object);
      for (const other of others) {
        if (object === other) {
          continue;
        }
        if (regionsCollide(object, other)) {
          seperateGameObjects(object, other);
        }
      }
    }

    // for (const object of this.all.values()) {
    //   const tiles = this.world.tileMap.getSolidTileDetailsInRegion(object);

    //   for (const tile of tiles) {
    //     if (regionsCollide(object, tile.region)) {
    //       sepearteGameObjectFromTile(object, tile);
    //     }
    //   }
    // }
  }

  cleanup() {
    // this.quadTree.cleanup();
  }

  query(region: Region): GameObject[] {
    return this.spatialHash.query(region);
  }

  queryByRadius(point: Vector, radius: number, type?: any): GameObject[] {
    const potentials = this.query({
      left: point.x - radius,
      top: point.y - radius,
      right: point.x + radius,
      bottom: point.y + radius,
    });

    return potentials.filter((entity) => {
      return vectors.withinDistance(point, entity.p, radius);
    });
  }

  render(g: PIXI.Graphics) {}
}
