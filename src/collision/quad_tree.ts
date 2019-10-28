import {GameObject, Region, GameComponent, Renderable} from '../models/models';
import {regionsCollide} from './collisions';

export class QuadTree implements GameComponent {
  objectToNode: WeakMap<GameObject, Node>;
  root: Node;

  constructor(region: Region) {
    this.objectToNode = new WeakMap<GameObject, Node>();
    this.root = new Node(region, 1, this.objectToNode, null);
  }

  add(o: GameObject) {
    this.root.add(o);
  }
  remove(o: GameObject) {
    const node = this.objectToNode.get(o);
    if (node) {
      node.remove(o);
      this.objectToNode.delete(o);
    }
  }

  query(region: Region): GameObject[] {
    return this.root.query(region);
  }

  getNode(o: GameObject) {
    return this.objectToNode.get(o);
  }

  move(o: GameObject) {
    const node = this.objectToNode.get(o);
    if (node) node.move(o);
    // this.remove(o);
    // this.add(o);
  }

  update(delta: number): void {}
  render(graphics: PIXI.Graphics): void {
    this.root.render(graphics);
  }
}

class Node implements Renderable {
  private sectors: Sectors | undefined;
  private objects: GameObject[] = [];
  region: Region;
  private depth: number;
  // private readonly objectToNode: WeakMap<GameObject, Node>;

  constructor(
    region: Region,
    depth: number,
    private readonly objectToNode: WeakMap<GameObject, Node>,
    private readonly parent: Node | null,
  ) {
    this.region = region;
    this.depth = depth;
    // this.objectToNode = objectToNode;
  }

  add(o: GameObject): Node {
    const sector = this.getSectorForRegion(o);
    if (sector) return sector.add(o);

    if (this.shouldDivideForNewObject()) {
      this.divide();
      return this.add(o);
    }

    this.objects.push(o);
    this.objectToNode.set(o, this);
    return this;
  }

  move(o: GameObject) {
    if (this.containsRegion(o)) {
      const sector = this.getSectorForRegion(o);
      if (sector) {
        const index = this.objects.indexOf(o);
        if (index > -1) this.objects.splice(index);
        sector.add(o);
      }
    } else if (this.parent) {
      const index = this.objects.indexOf(o);
      if (index > -1) this.objects.splice(index);
      this.parent.moveUp(o);

      this.cleanup();
    }
  }

  moveUp(o: GameObject) {
    if (this.containsRegion(o) || !this.parent) {
      this.add(o);
    } else {
      this.parent.moveUp(o);
    }
  }

  query(region: Region): GameObject[] {
    const sector = this.getSectorForRegion(region);
    // if (sector) return sector.query(region);

    const results: GameObject[] = [];
    results.push(...this.objects);

    if (sector) {
      results.push(...sector.query(region));
    } else if (this.sectors) {
      results.push(...this.objectsRecursive());
    }
    return results;
    // return this.objectsRecursive();
    // if (this.sectors) {
    //   if (regionsCollide(this.sectors.nw.region, region)) {
    //     results.push(...this.sectors.nw.objectsRecursive());
    //     // results.push(
    //     //   ...this.sectors.nw.query(
    //     //     intersectRegions(region, this.sectors.nw.region),
    //     //   ),
    //     // );
    //   }

    //   if (regionsCollide(this.sectors.ne.region, region)) {
    //     results.push(...this.sectors.ne.objectsRecursive());
    //     // results.push(
    //     //   ...this.sectors.ne.query(
    //     //     intersectRegions(region, this.sectors.ne.region),
    //     //   ),
    //     // );
    //   }

    //   if (regionsCollide(this.sectors.sw.region, region)) {
    //     results.push(...this.sectors.sw.objectsRecursive());
    //     // results.push(
    //     //   ...this.sectors.sw.query(
    //     //     intersectRegions(region, this.sectors.sw.region),
    //     //   ),
    //     // );
    //   }

    //   if (regionsCollide(this.sectors.se.region, region)) {
    //     results.push(...this.sectors.se.objectsRecursive());
    //     // results.push(
    //     //   ...this.sectors.se.query(
    //     //     intersectRegions(region, this.sectors.se.region),
    //     //   ),
    //     // );
    //   }
    // }

    // if (this.sectors) {
    //   const sector = this.getSectorForRegion(region);
    //   if (sector) {
    //     return sector.query(region);
    //   } else {

    //   }
    // }

    // results.push(...this.objects.filter(o => isRegionWithin(region, o)));
    results.push(...this.objects);
    return results;
  }

  private objectsRecursive() {
    const result: GameObject[] = [];
    result.push(...this.objects);
    if (this.sectors) {
      result.push(...this.sectors.nw.objectsRecursive());
      result.push(...this.sectors.ne.objectsRecursive());
      result.push(...this.sectors.sw.objectsRecursive());
      result.push(...this.sectors.se.objectsRecursive());
    }

    return result;
  }

  private getSectorForRegion(r: Region): Node | undefined {
    if (!this.sectors) {
      return undefined;
    }

    if (this.sectors.nw.containsRegion(r)) {
      return this.sectors.nw;
    } else if (this.sectors.ne.containsRegion(r)) {
      return this.sectors.ne;
    } else if (this.sectors.sw.containsRegion(r)) {
      return this.sectors.sw;
    } else if (this.sectors.se.containsRegion(r)) {
      return this.sectors.se;
    }

    return undefined;
  }

  private shouldDivideForNewObject() {
    return !this.sectors && this.objects.length >= 1 && this.depth < 7;
  }

  private divide() {
    this.createSectors();
    this.moveObjectsToSectors();
  }

  private createSectors() {
    const r = this.region;
    const nw = new Node(
      {
        top: r.top,
        left: r.left,
        bottom: regionMidY(r),
        right: regionMidX(r),
      },
      this.depth + 1,
      this.objectToNode,
      this,
    );

    const ne = new Node(
      {
        top: r.top,
        left: regionMidX(r),
        bottom: regionMidY(r),
        right: r.right,
      },
      this.depth + 1,
      this.objectToNode,
      this,
    );

    const sw = new Node(
      {
        top: regionMidY(r),
        left: r.left,
        bottom: r.bottom,
        right: regionMidX(r),
      },
      this.depth + 1,
      this.objectToNode,
      this,
    );

    const se = new Node(
      {
        top: regionMidY(r),
        left: regionMidX(r),
        bottom: r.bottom,
        right: r.right,
      },
      this.depth + 1,
      this.objectToNode,
      this,
    );

    this.sectors = {nw, ne, sw, se};
  }

  private moveObjectsToSectors() {
    const objects = this.objects;
    this.objects = [];

    for (const o of objects) {
      this.add(o);
    }
  }

  containsRegion(region: Region): boolean {
    return isRegionWithin(this.region, region);
  }

  // move(o: GameObject) {
  //   const sector = this.getSectorForObject(o);
  //   if (sector) {

  //   }
  // }

  remove(o: GameObject) {
    const index = this.objects.indexOf(o);

    if (index !== -1) {
      this.objects.splice(index, 1);
    } else {
      const sector = this.getSectorForRegion(o);
      if (sector) sector.remove(o);
    }

    this.cleanup();
  }

  cleanup() {
    if (this.sizeOfChildren() === 0) {
      this.sectors = undefined;
    }

    if (this.objects.length === 0) {
      if (this.parent) this.parent.cleanup();
    }
  }

  size(): number {
    return this.objects.length + this.sizeOfChildren();
  }

  sizeOfChildren() {
    if (this.sectors) {
      return (
        this.sectors.nw.size() +
        this.sectors.ne.size() +
        this.sectors.sw.size() +
        this.sectors.se.size()
      );
    }

    return 0;
  }

  render(graphics: PIXI.Graphics): void {
    // return;
    const r = this.region;
    const alpha = (10 - this.depth + 1) / 10;

    if (this.sectors) {
      this.sectors.nw.render(graphics);
      this.sectors.ne.render(graphics);
      this.sectors.sw.render(graphics);
      this.sectors.se.render(graphics);
    }

    graphics.lineStyle(1, 0x3352ff, alpha);
    graphics.drawRect(r.left, r.top, regionWidth(r), regionHeight(r));
  }
}

export interface HasBounds {
  region(): Region;
}

interface Sectors {
  ne: Node;
  nw: Node;
  sw: Node;
  se: Node;
}

function isRegionWithin(haystack: Region, needle: Region) {
  return (
    needle.left >= haystack.left &&
    needle.right <= haystack.right &&
    needle.top >= haystack.top &&
    needle.bottom <= haystack.bottom
  );
}

function regionWidth(r: Region) {
  return r.right - r.left;
}

function regionHeight(r: Region) {
  return r.bottom - r.top;
}

function regionMidX(r: Region) {
  return r.left + (r.right - r.left) / 2;
}

function regionMidY(r: Region) {
  return r.top + (r.bottom - r.top) / 2;
}

function intersectRegions(r1: Region, r2: Region) {
  return {
    top: Math.max(r1.top, r2.top),
    left: Math.max(r1.left, r2.left),
    right: Math.min(r1.right, r2.right),
    bottom: Math.min(r1.bottom, r2.bottom),
  };
}
