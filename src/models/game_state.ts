import * as PIXI from 'pixi.js';
import {Region} from './models';

export class GameState {
  constructor(public readonly bounds: Region, public stage: PIXI.Container) {}
}
