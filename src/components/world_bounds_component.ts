import {GameComponent, GameObject} from '../models/models';

/**
 * A component that keeps the game object within the bounds the world.
 *
 * Note: This is really hacky until I have real collision detection in.
 * We simply bounce the object of the screen size by inverting the accel
 * and velocity vectors.
 */
export class WorldBoundsComponent implements GameComponent {
  constructor(
    private readonly object: GameObject,
    private readonly app: PIXI.Application,
  ) {}

  update(deltaMs: number): void {
    const view = this.app.view;

    if (this.object.p.x > view.width) {
      this.object.v.x *= -1;
      this.object.a.x *= -1 * 0.9;
      this.object.p.x = view.width;
    } else if (this.object.p.x < 0) {
      this.object.v.x *= -1;
      this.object.a.x *= -1 * 0.9;
      this.object.p.x = 0;
    }

    if (this.object.p.y > view.height) {
      this.object.v.y *= -1;
      this.object.a.y *= -1 * 0.9;
      this.object.p.y = view.height;
    } else if (this.object.p.y < 0) {
      this.object.v.y *= -1;
      this.object.a.y *= -1 * 0.9;
      this.object.p.y = 0;
    }
  }

  render(): void {}
}
