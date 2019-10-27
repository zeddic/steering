import {GameComponent, GameObject} from '../models/models';
import * as PIXI from 'pixi.js';

export class DebugComponent implements GameComponent {
  // private readonly sprite: PIXI.Sprite;

  constructor(private readonly object: GameObject) {}

  update(deltaMs: number): void {}

  render(): void {}
}
