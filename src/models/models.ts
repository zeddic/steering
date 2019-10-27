import {Vector} from '../util/vector';

export interface Updatable {
  update(delta: number): void;
}

export interface Renderable {
  render(): void;
}

export interface Region {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface GameComponent extends Updatable, Renderable {}

export interface GameObject extends Updatable, Renderable, Region {
  /** Position */
  p: Vector;

  /** Velocity */
  v: Vector;

  /** Acceleration */
  a: Vector;

  /** The number of degrees the object is rotated. VISUAL ONLY. Does not effect collision. */
  rotation: number;

  x: number;
  y: number;
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;

  mass: number;

  region(): Region;
}
