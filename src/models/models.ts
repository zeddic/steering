import * as PIXI from 'pixi.js';
import {Vector} from '../util/vector';

export interface Updatable {
  update(delta: number): void;
}

export interface Renderable {
  render(graphics: PIXI.Graphics): void;
}

export interface Region {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export interface GameComponent extends Updatable, Renderable {}
