import {Assets, Texture} from 'pixi.js';

/**
 * Contains mapping of tile id to the type of tile that should be shown.
 * Used by TileMaps.
 */
export class TileAtlas {
  data = new Map<number, Tile>();

  constructor() {}

  has(id: number) {
    return this.data.has(id);
  }

  add(id: number, config: TileConfig) {
    const texture = Assets.get(config.resource);

    if (!texture) {
      throw new Error(`${config.resource} not found for tile ${id}!`);
    }

    const details: Tile = {
      id,
      isSolid: config.isSolid,
      texture,
    };

    this.data.set(id, details);
  }

  get(id: number): Tile | undefined {
    return this.data.get(id);
  }
}

export interface TileConfig {
  isSolid: boolean;
  resource: string;
}

/**
 * Information about a particular tile.
 */
export interface Tile {
  id: number;
  isSolid: boolean;
  texture: Texture;
}
