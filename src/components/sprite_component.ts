import * as PIXI from 'pixi.js';
import {GameComponent, GameObject} from '../models/models';

export class SpriteComponent implements GameComponent {
  private readonly sprite: PIXI.Sprite;

  constructor(
    private readonly object: GameObject,
    readonly app: PIXI.Application,
    readonly resource: string,
    readonly options: {scale?: number} = {},
  ) {
    const texture = app.loader.resources[resource]!.texture;
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;

    if (options.scale) {
      const scale = new PIXI.Point(options.scale, options.scale);
      this.sprite.scale = scale;
    }
    this.syncSpriteWithGameObject();
    app.stage.addChild(this.sprite);
  }

  public update(deltaMs: number): void {
    this.syncSpriteWithGameObject();
  }

  public render(): void {}

  private syncSpriteWithGameObject() {
    this.sprite.x = this.object.p.x;
    this.sprite.y = this.object.p.y;
    this.sprite.rotation = PIXI.DEG_TO_RAD * this.object.rotation;
  }
}
