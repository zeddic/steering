import {GameObject, GameComponent} from './models';
import {Vector} from '../util/vector';

export class BaseGameObject implements GameObject {
  p = new Vector(0, 0);
  v = new Vector(0, 0);
  a = new Vector(0, 0);
  rotation = 0;

  update(delta: number) {}

  render() {}
}
