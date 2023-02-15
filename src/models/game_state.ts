import * as PIXI from 'pixi.js';
import {Region} from './models';
import {Input} from '../input';
import {World} from '../world';

// todo(scott): find a better way of passing game state around.
export class GameState {
  constructor(
    public readonly world: World,
    public stage: PIXI.Container,
    public graphics: PIXI.Graphics,
    public input: Input,
  ) {}

  get bounds(): Region {
    return this.world.bounds;
  }
}
