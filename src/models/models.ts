import {Vector} from '../util/vector';

export interface Updatable {
  update(delta: number): void;
}

export interface Renderable {
  render(): void;
}

export interface GameComponent extends Updatable, Renderable {}

export interface GameObject extends Updatable, Renderable {
  /** Position */
  p: Vector;

  /** Velocity */
  v: Vector;

  /** Acceleration */
  a: Vector;

  /** The number of degrees the object is rotated. VISUAL ONLY. Does not effect collision. */
  rotation: number;
}
