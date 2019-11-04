import {GameComponent, Region} from './models/models';
import {getClosestExponentOfTwo} from './util/math';

export interface TileMapOptions {
  /**
   * The size per tile.
   * This must be a power of 2 (32, 64, 128, etc.)
   */
  tileSize: number;

  /**
   * The map of tiles. Each entry is a row, with the sub-array being columns.
   */
  map: number[][];
}

export class TileMap implements GameComponent {
  /**
   * The map.
   */
  tiles: number[][] = [];

  /**
   * The size of each tile.
   */
  tileSize: number;

  /**
   * The grid size expressed as an exponent of 2.
   * Used to bit-shift world units to quickly map them to tiles.
   * eg 5 => 2^5 => 32px by 32x
   */
  exponentOfTwo: number;

  constructor(options: TileMapOptions) {
    this.tiles = options.map;
    this.tileSize = options.tileSize;
    this.exponentOfTwo = getClosestExponentOfTwo(options.tileSize);
  }

  update(delta: number): void {}

  render(graphics: PIXI.Graphics): void {
    for (let row = 0; row < this.tiles.length; row++) {
      const rowTiles = this.tiles[row];
      for (let col = 0; col < rowTiles.length; col++) {
        const tileNum = rowTiles[col];
        const x = col * this.tileSize;
        const y = row * this.tileSize;

        if (tileNum === 1) {
          graphics.beginFill(0x3352ff, 0.6);
          graphics.drawRect(x, y, this.tileSize, this.tileSize);
          graphics.endFill();
        }
      }
    }
  }

  public getSolidTileDetailsInRegion(region: Region) {
    const details = this.getTilesDetailsInRegion(region);
    return details.filter(d => d.solid);
  }

  public getTilesDetailsInRegion(region: Region) {
    const sCol = region.left >> this.exponentOfTwo;
    const sRow = region.top >> this.exponentOfTwo;
    const eCol = region.right >> this.exponentOfTwo;
    const eRow = region.bottom >> this.exponentOfTwo;

    const tiles: TileDetails[] = [];
    for (let col = sCol; col <= eCol; col++) {
      for (let row = sRow; row <= eRow; row++) {
        const tile = this.getTile(col, row);
        if (!tile) continue;

        const details: TileDetails = {
          region: this.tileToRegion(col, row),
          solid: isSolid(tile),
          solidFaces: {
            n: !isSolid(this.getAbove(col, row)),
            s: !isSolid(this.getBelow(col, row)),
            w: !isSolid(this.getLeft(col, row)),
            e: !isSolid(this.getRight(col, row)),
          },
        };

        tiles.push(details);
      }
    }

    return tiles;
  }

  private getTileAtXY(x: number, y: number) {
    const col = x >> this.exponentOfTwo;
    const row = y >> this.exponentOfTwo;
    return this.getTile(col, row);
  }

  private getTile(col: number, row: number): number {
    const tiles = this.tiles[row];
    return tiles && tiles[col];
  }

  private getAbove(col: number, row: number) {
    return this.getTile(col, row - 1);
  }

  private getBelow(col: number, row: number) {
    return this.getTile(col, row + 1);
  }

  private getLeft(col: number, row: number) {
    return this.getTile(col - 1, row);
  }
  private getRight(col: number, row: number) {
    return this.getTile(col + 1, row);
  }

  private convertRegion(region: Region): Region {
    return {
      top: region.top >> this.exponentOfTwo,
      left: region.left >> this.exponentOfTwo,
      bottom: region.bottom >> this.exponentOfTwo,
      right: region.right >> this.exponentOfTwo,
    };
  }

  private tileToRegion(col: number, row: number): Region {
    return {
      top: row << this.exponentOfTwo,
      left: col << this.exponentOfTwo,
      right: (col + 1) << this.exponentOfTwo,
      bottom: (row + 1) << this.exponentOfTwo,
    };
  }
}

/**
 * Returns true if a tile is solid.
 */
function isSolid(tile: number) {
  return tile === 1;
}

/**
 * Metadata about a tile.
 */
export interface TileDetails {
  /** Its bounds. */
  region: Region;

  /**
   * Whether it is solid for collision.
   * Note that even if it is solid, only some faces of the square will be checked
   * for collision.
   */
  solid: boolean;

  /** What surfaces of the tile are considered solid. */
  solidFaces: {
    n: boolean;
    w: boolean;
    e: boolean;
    s: boolean;
  };
}
