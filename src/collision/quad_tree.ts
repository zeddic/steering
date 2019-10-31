import {GameObject, Region, GameComponent, Renderable} from '../models/models';
import {regionsCollide} from './collisions';

/**
 * Options for a quad tree.
 */
export interface QuadTreeOptions {
  /**
   * The bounds in 2d space that the tree spans.
   */
  region: Region;

  /**
   * The maximum depth of nodes the tree may have.
   */
  maxDepth?: number;

  /**
   * The maximum number of game objects that can reside in a node before subidividing.
   */
  maxNodePop?: number;

  /**
   * Whether the tree should start in debug mode.
   */
  debug?: boolean;
}

/**
 * A tree data structure that recursivly subdivides a 2d region into
 * quadrants.
 *
 * Objects may be added to the tree, which will keep track of their position.
 * The tree may later be queried with a region to obtain possible objects
 * that fall into that region.
 */
export class QuadTree implements Renderable {
  /**
   * A weak map from game object to the node within the
   * tree that it resides in. This allows us to identify where an object
   * used to reside in case it moved since the last time the tree saw it.
   */
  private objectToNode = new WeakMap<GameObject, Node>();

  /**
   * The top-most node of the quad tree.
   */
  private root: Node;

  /**
   * Whether the tree should render debug data.
   */
  private debug = false;

  constructor(private readonly options: QuadTreeOptions) {
    const nodeConfig = {
      maxDepth: options.maxDepth || 10,
      maxNodePop: options.maxNodePop || 4,
    };

    this.debug = options.debug!!;
    this.root = new Node(options.region, 0, null, nodeConfig);
  }

  /**
   * Enables debug mode. When enabled, the quad tree will be rendered with
   * bounding boxes to help diagnose behvaior.
   */
  setDebugMode(enabled: boolean) {
    this.debug = enabled;
  }

  /**
   * Adds an object to the tree. The object will be placed in the smallest node that covers the objects entire region.
   */
  add(o: GameObject): void {
    const addedToNode = this.root.add(o);
    this.objectToNode.set(o, addedToNode);
  }

  /**
   * Removes an object from the tree.
   * Note: The quad tree does not auto-cleanup empty leaf nodes upon removal. Call
   * cleanup() afterwards to compatct the tree.
   */
  remove(o: GameObject): void {
    const node = this.objectToNode.get(o);
    if (node) {
      node.remove(o);
      this.objectToNode.delete(o);
    }
  }

  /**
   * Queries the quad tree for a region and returns all possible game objects
   * that should be considered for collisions within that region.
   *
   * Note: In some cases this may include objects outside of the region if
   * those objects happened to sit on a cross-axis of a node.
   */
  query(region: Region): GameObject[] {
    const result: GameObject[] = [];
    const toProcess = [this.root];

    while (toProcess.length > 0) {
      const node = toProcess.pop()!;
      result.push(...node.objects);

      if (node.sectors) {
        if (regionsCollide(node.sectors.nw.region, region)) {
          toProcess.push(node.sectors.nw);
        }

        if (regionsCollide(node.sectors.ne.region, region)) {
          toProcess.push(node.sectors.ne);
        }

        if (regionsCollide(node.sectors.sw.region, region)) {
          toProcess.push(node.sectors.sw);
        }

        if (regionsCollide(node.sectors.se.region, region)) {
          toProcess.push(node.sectors.se);
        }
      }
    }

    return result;
  }

  /**
   * Handles an object having moved by updating its node in the quad tree.
   *
   * This takes advantage of the fact that most time objects move they remain
   * in the same node or within a parent node. This allows us to update an
   * objects position without doing a full remove() + add().
   */
  move(o: GameObject): void {
    const node = this.objectToNode.get(o);
    if (!node) return;

    if (node.containsRegion(o)) {
      const sector = node.getSectorForRegion(o);
      if (sector) {
        node.remove(o);
        const newHome = sector.add(o);
        this.objectToNode.set(o, newHome);
      }
    } else if (node.parent) {
      this.remove(o);

      let dest = node.parent;
      while (!dest.containsRegion(o) && !!dest.parent) {
        dest = dest.parent;
      }

      const newHome = dest.add(o);
      this.objectToNode.set(o, newHome);
    }
  }

  /**
   * Compacts the tree by collapsing nodes who's children nodes are all empty.
   */
  cleanup() {
    this.root.cleanup();
  }

  /**
   * Renders debug data for the tree when debug mode is enabled.
   */
  render(graphics: PIXI.Graphics): void {
    if (this.debug) {
      this.root.render(graphics);
    }
  }
}

/**
 * Options for a quad tree node.
 */
interface NodeOptions {
  maxDepth: number;
  maxNodePop: number;
}

/**
 * The possible sub-nodes of a quad tree node.
 */
interface Sectors {
  ne: Node; // north east
  nw: Node; // north west
  sw: Node; // south west
  se: Node; // south east
}

/**
 * A single node within the quad tree. Each node may either be a leaf node
 * or be furthur subdivided into quadrants. Nodes will automatically subdivide
 * when a new item is added that would cause the node to surpase it's maximum
 * population.
 *
 * When objects are placed into the tree, they are put in the smallest node
 * that contains their entire region. This can result in non-leaf nodes
 * also containing objects.
 */
class Node implements Renderable {
  /**
   * Child quadrants. This may be undefined if the node is a leaf node.
   */
  sectors: Sectors | undefined;

  /**
   * Objects within this node.
   */
  objects: GameObject[] = [];

  constructor(
    readonly region: Region,
    readonly depth: number,
    readonly parent: Node | null,
    readonly options: NodeOptions,
  ) {}

  /**
   * Adds an object to this node (or one of its children).
   * Returns the node that the object was eventually added to.
   */
  add(o: GameObject): Node {
    // Is there a child node that will fit this?
    const sector = this.getSectorForRegion(o);
    if (sector) return sector.add(o);

    // If this item would cause the node to pass its pop-limit,
    // subdivide and try adding again.
    if (this.shouldDivideForNewObject()) {
      this.subdivide();
      return this.add(o);
    }

    this.objects.push(o);
    return this;
  }

  /**
   * Given a region returns a quadrant that fully contains that region.
   * Returns undefined if there is no quadrant that does.
   */
  getSectorForRegion(r: Region): Node | undefined {
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

  /**
   * Returns true if this node has reached its population limit
   * and a new item should cause it to split.
   */
  private shouldDivideForNewObject() {
    return (
      !this.sectors &&
      this.objects.length >= this.options.maxNodePop &&
      this.depth < this.options.maxDepth
    );
  }

  /**
   * Subdivides this node into sub-quardrants then tries to move
   * any existing occupants to the sub-quardrants if possible.
   */
  private subdivide() {
    this.createSectors();
    this.moveObjectsToSectors();
  }

  /**
   * Creates quadrants.
   */
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
      this,
      this.options,
    );

    const ne = new Node(
      {
        top: r.top,
        left: regionMidX(r),
        bottom: regionMidY(r),
        right: r.right,
      },
      this.depth + 1,
      this,
      this.options,
    );

    const sw = new Node(
      {
        top: regionMidY(r),
        left: r.left,
        bottom: r.bottom,
        right: regionMidX(r),
      },
      this.depth + 1,
      this,
      this.options,
    );

    const se = new Node(
      {
        top: regionMidY(r),
        left: regionMidX(r),
        bottom: r.bottom,
        right: r.right,
      },
      this.depth + 1,
      this,
      this.options,
    );

    this.sectors = {nw, ne, sw, se};
  }

  /**
   * Moves existing occupants to quadrants.
   */
  private moveObjectsToSectors() {
    const objects = this.objects;
    this.objects = [];

    for (const o of objects) {
      this.add(o);
    }
  }

  /**
   * Returns true if this node fully contains another region.
   */
  containsRegion(region: Region): boolean {
    return isRegionWithin(this.region, region);
  }

  /**
   * Removes the game object from the specified node or any of its children.
   */
  remove(o: GameObject) {
    const index = this.objects.indexOf(o);
    if (index !== -1) {
      this.objects.splice(index, 1);
      return;
    }

    const sector = this.getSectorForRegion(o);
    if (sector) sector.remove(o);
  }

  /**
   * Recursively collapses nodes whos quadrants are empty.
   */
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

// UTILITY METHIDS

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
