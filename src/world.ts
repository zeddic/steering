import {GameComponent, Region} from './models/models';
import {GameState2} from './game';

// prettier-ignore
const TILES = [
 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
 [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,],
 [1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0,],
 [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0,],
 [1, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0,],
];

const TILE_SIZE = 32;

export class World implements GameComponent {
  constructor(readonly bounds: Region) {}

  update(delta: number): void {}
  render(graphics: PIXI.Graphics): void {
    for (let row = 0; row < TILES.length; row++) {
      const rowTiles = TILES[row];
      for (let col = 0; col < rowTiles.length; col++) {
        const tileNum = rowTiles[col];
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;

        if (tileNum === 1) {
          graphics.beginFill(0x3352ff, 0.6);
          graphics.drawRect(x, y, TILE_SIZE, TILE_SIZE);
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
    const sCol = region.left >> 5;
    const sRow = region.top >> 5;
    const eCol = region.right >> 5;
    const eRow = region.bottom >> 5;

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
    const col = x >> 5;
    const row = y >> 5;
    return this.getTile(col, row);
  }

  private getTile(col: number, row: number): number {
    const tiles = TILES[row];
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
      top: region.top >> 5,
      left: region.left >> 5,
      bottom: region.bottom >> 5,
      right: region.right >> 5,
    };
  }

  private tileToRegion(col: number, row: number): Region {
    return {
      top: row << 5,
      left: col << 5,
      right: (col + 1) << 5,
      bottom: (row + 1) << 5,
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
