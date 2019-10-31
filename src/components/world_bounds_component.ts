import {GameComponent, GameObject, Region} from '../models/models';

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
    private readonly region: Region,
  ) {}

  update(deltaMs: number): void {
    const region = this.region;

    if (this.object.right > region.right) {
      this.object.v.x *= -1;
      this.object.a.x *= -1 * 0.9;
      this.object.right = region.right;
    } else if (this.object.left < region.left) {
      this.object.v.x *= -1;
      this.object.a.x *= -1 * 0.9;
      this.object.left = region.left;
    }

    if (this.object.bottom > region.bottom) {
      this.object.v.y *= -1;
      this.object.a.y *= -1 * 0.9;
      this.object.bottom = region.bottom;
    } else if (this.object.top < region.top) {
      this.object.v.y *= -1;
      this.object.a.y *= -1 * 0.9;
      this.object.top = region.top;
    }
  }

  render(): void {}
}
