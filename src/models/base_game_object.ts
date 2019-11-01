import * as PIXI from 'pixi.js';
import {Vector} from '../util/vector';
import {GameComponent, GameObject, Region} from './models';

export class BaseGameObject implements GameObject {
  public p = new Vector(0, 0);
  public v = new Vector(0, 0);
  public a = new Vector(0, 0);
  public width = 0;
  public height = 0;
  public rotation = 0;
  public mass = 1;

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

  public region(): Region {
    return {
      top: this.top,
      left: this.left,
      bottom: this.bottom,
      right: this.right,
    };
  }

  public update(delta: number) {}

  public render(graphics: PIXI.Graphics) {}
}
