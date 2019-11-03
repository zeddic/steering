import * as PIXI from 'pixi.js';
import {Region} from './models';
import {Input} from '../input';

// todo(scott): find a better way of passing game state around.
export class GameState {
  constructor(
    public readonly bounds: Region,
    public stage: PIXI.Container,
    public input: Input,
  ) {}
}
