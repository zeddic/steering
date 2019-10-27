import {GameObject, Region} from '../models/models';

export class QuadTree<T extends HasBounds> {
  constructor(region: Region) {}

  add(o: GameObject) {}

  remove(o: GameObject) {}
}

class Node<T extends HasBounds> {
  children: T[] = [];
}

export interface HasBounds {
  region(): Region;
}
