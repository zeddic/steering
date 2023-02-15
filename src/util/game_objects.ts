import {GameObject} from '../models/game_object';

export function lookAtVelocity(object: GameObject) {
  if (!object.v.isZero()) {
    object.rotation = object.v.deg();
  }
}
