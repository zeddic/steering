import {GameObject, GameComponent, Region} from './models';
import {Vector} from '../util/vector';
import * as PIXI from 'pixi.js';

export class BaseGameObject implements GameObject {
  p = new Vector(0, 0);
  v = new Vector(0, 0);
  a = new Vector(0, 0);
  width = 0;
  height = 0;
  rotation = 0;
  mass = 1;

  get x(): number {
    return this.p.x;
  }
  set x(x: number) {
    this.p.x = x;
  }

  get y(): number {
    return this.p.y;
  }
  set y(y: number) {
    this.p.y = y;
  }

  get left(): number {
    return this.p.x - this.width / 2;
  }
  set left(left: number) {
    this.p.x = left + this.width / 2;
  }

  get right(): number {
    return this.p.x + this.width / 2;
  }
  set right(right: number) {
    this.p.x = right - this.width / 2;
  }

  get top(): number {
    return this.p.y - this.height / 2;
  }
  set top(top: number) {
    this.p.y = top + this.height / 2;
  }

  get bottom(): number {
    return this.p.y + this.height / 2;
  }
  set bottom(bottom: number) {
    this.p.y = bottom - this.height / 2;
  }

  region(): Region {
    return {
      top: this.top,
      left: this.left,
      bottom: this.bottom,
      right: this.right,
    };
  }

  update(delta: number) {}

  render(graphics: PIXI.Graphics) {}
}
