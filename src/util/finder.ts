import {GameObject} from '../models/game_object';
import {World} from '../world';

export class Finder {
  constructor(private readonly entity: GameObject, private readonly world: World) {}

  find(radius: number): GameObject[] {
    return this.world.collisionSystem.queryByRadius(this.entity.p, radius);
  }

  findOtherWithType(radius: number, type: string): GameObject[] {
    return this.find(radius).filter((other) => other.type === type);
  }
}
