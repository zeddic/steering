import * as PIXI from 'pixi.js';
import {GameComponent} from '../models/models';
import {GameState} from '../models/game_state';
import {GameObject} from '../models/game_object';
import {getLoader} from '../resources';

export class SpriteComponent implements GameComponent {
  private readonly sprite: PIXI.Sprite;

  constructor(
    private readonly object: GameObject,
    readonly state: GameState,
    readonly resource: string,
    readonly options: {scale?: number} = {},
  ) {
    const loader = getLoader();
    const texture = loader.resources[resource]!.texture;
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;

    if (options.scale) {
      const scale = new PIXI.Point(options.scale, options.scale);
      this.sprite.scale = scale;
    }
    this.syncSpriteWithGameObject();
    state.stage.addChild(this.sprite);
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
