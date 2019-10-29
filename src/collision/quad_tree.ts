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
  }

  update(delta: number): void {
    this.cleanup();
  }

  cleanup() {
    this.root.cleanup();
  }

  render(graphics: PIXI.Graphics): void {
    // this.root.render(graphics);
  }
}

class Node implements Renderable {
  private sectors: Sectors | undefined;
  private objects: GameObject[] = [];

  constructor(
    private readonly region: Region,
    private readonly depth: number,
    private readonly objectToNode: WeakMap<GameObject, Node>,
    private readonly parent: Node | null,
  ) {}

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
        if (index > -1) this.objects.splice(index, 1);
        sector.add(o);
      }
    } else if (this.parent) {
      const index = this.objects.indexOf(o);
      if (index > -1) this.objects.splice(index, 1);
      this.parent.moveUp(o);
    }
  }

  moveUp(o: GameObject) {
    if (this.containsRegion(o) || !this.parent) {
      this.add(o);
    } else {
      this.parent.moveUp(o);
    }
  }

  query(region: Region, addTo: GameObject[] = []): GameObject[] {
    addTo.push(...this.objects);

    if (this.sectors) {
      if (regionsCollide(this.sectors.nw.region, region)) {
        this.sectors.nw.query(region, addTo);
      }

      if (regionsCollide(this.sectors.ne.region, region)) {
        this.sectors.ne.query(region, addTo);
      }

      if (regionsCollide(this.sectors.sw.region, region)) {
        this.sectors.sw.query(region, addTo);
      }

      if (regionsCollide(this.sectors.se.region, region)) {
        this.sectors.se.query(region, addTo);
      }
    }
    return addTo;
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
    return !this.sectors && this.objects.length >= 4 && this.depth < 7;
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

  remove(o: GameObject) {
    const index = this.objects.indexOf(o);
    if (index !== -1) {
      this.objects.splice(index, 1);
    } else {
      const sector = this.getSectorForRegion(o);
      if (sector) sector.remove(o);
    }
  }

  cleanup(): number {
    let size = 0;

    if (this.sectors) {
      size += this.sectors.nw.cleanup();
      size += this.sectors.ne.cleanup();
      size += this.sectors.sw.cleanup();
      size += this.sectors.se.cleanup();
      if (size === 0) this.sectors = undefined;
    }

    return (size += this.objects.length);
  }

  render(graphics: PIXI.Graphics): void {
    const r = this.region;
    const alpha = (10 - this.depth + 1) / 10;

    if (this.sectors) {
      this.sectors.nw.render(graphics);
      this.sectors.ne.render(graphics);
      this.sectors.sw.render(graphics);
      this.sectors.se.render(graphics);
    }

    const thickness = 10 - this.depth + 1;
    graphics.lineStyle(thickness / 4, 0x3352ff, alpha);
    graphics.drawRect(r.left, r.top, regionWidth(r), regionHeight(r));

    for (const o of this.objects) {
      graphics.lineStyle(1, 0xf5c242, 1);
      graphics.moveTo(regionMidX(r), regionMidY(r));
      graphics.lineTo(o.x, o.y);
    }
  }
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
