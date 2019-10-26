import {GameComponent, GameObject} from '../models/models';
import * as PIXI from 'pixi.js';

export class SpriteComponent implements GameComponent {
  private readonly sprite: PIXI.Sprite;

  constructor(
    private readonly object: GameObject,
    readonly app: PIXI.Application,
    readonly resource: string,
  ) {
    const texture = app.loader.resources[resource]!.texture;
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;
    this.syncSpriteWithGameObject();
    app.stage.addChild(this.sprite);
  }

  update(deltaMs: number): void {
    this.syncSpriteWithGameObject();
  }

  render(): void {}

  private syncSpriteWithGameObject() {
    this.sprite.x = this.object.p.x;
    this.sprite.y = this.object.p.y;
    this.sprite.rotation = PIXI.DEG_TO_RAD * this.object.rotation;
  }
}
