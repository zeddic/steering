import {GameComponent, Region} from './models/models';
import {TileMap} from './tile_map';

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

export class World implements GameComponent {
  public tileMap: TileMap;

  constructor(readonly bounds: Region) {
    this.tileMap = new TileMap({
      map: TILES,
      tileSize: 32,
    });
  }

  update(delta: number): void {
    this.tileMap.update(delta);
  }

  render(graphics: PIXI.Graphics): void {
    this.tileMap.render(graphics);
  }
}
