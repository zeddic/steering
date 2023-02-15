import {Assets, ResolverManifest} from 'pixi.js';

export enum GameImage {
  SHIP = 'ship',
  TILE_FLOOR = 'tile_floor',
  TILE_WALL = 'tile_wall',
  FISH = 'fish',
  FISH_BIG = 'fish_big',
}

export const manifest: ResolverManifest = {
  bundles: [
    {
      name: 'main',
      assets: {
        [GameImage.SHIP]: 'assets/ship.png',
        [GameImage.FISH]: 'assets/fish.png',
        [GameImage.FISH_BIG]: 'assets/fish_big.png',
        [GameImage.TILE_FLOOR]: 'assets/tile_floor.png',
        [GameImage.TILE_WALL]: 'assets/tile_wall.png',
      },
    },
  ],
};

// export let globalLoader: Loader;

export async function loadAssets(): Promise<void> {
  Assets.init({manifest});
  const bundles = manifest.bundles.map((b) => b.name);
  await Assets.loadBundle(bundles);
}
