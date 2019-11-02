import {GameObject, Region} from '../models/models';
import {QuadTree} from './quad_tree';
import {SpatialHash} from './spatial_hash';
import * as PIXI from 'pixi.js';
import {regionsCollide, seperateGameObjects} from './collisions';

/**
 * Keeps track of the objects in the game world and resolves collisions.
 * May also be used to query the world for objects within a range.
 */
export class CollisionSystem {
  quadTree: QuadTree;
  spatialHash: SpatialHash;
  all = new Set<GameObject>();

  constructor(bounds: Region) {
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
    const objects = this.all.values();

    for (const object of objects) {
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
  }

  cleanup() {
    // this.quadTree.cleanup();
  }

  query(region: Region): GameObject[] {
    return this.spatialHash.query(region);
  }

  render(g: PIXI.Graphics) {}
}
