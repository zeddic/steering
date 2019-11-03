import * as PIXI from 'pixi.js';
import {GameComponent} from '../models/models';
import {GameObject} from '../models/game_object';

/**
 * A component that renders the bounding box and velocity vector of a game object
 * to make it easier to debug physics.j
 */
export class DebugComponent implements GameComponent {
  constructor(private readonly object: GameObject) {}

  public update(deltaMs: number): void {}

  public render(graphics: PIXI.Graphics): void {
    graphics.lineStyle(1, 0xff3333, 1);
    graphics.drawRect(
      this.object.left,
      this.object.top,
      this.object.width,
      this.object.height,
    );

    graphics.lineStyle(1, 0x3352ff, 1);
    graphics.moveTo(this.object.x, this.object.y);
    graphics.lineTo(
      this.object.x + this.object.v.x * 0.2,
      this.object.y + this.object.v.y * 0.2,
    );
  }
}
