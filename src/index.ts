import * as Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  constructor() {
    super('main');
  }

  preload() {
    this.load.image('ship', './assets/ship.gif');
  }

  create() {
    const ship = this.add.image(400, 150, 'ship');
    this.tweens.add({
      targets: ship,
      y: 450,
      duration: 2000,
      ease: 'Power2',
      yoyo: true,
      loop: -1,
    });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  title: 'Test Game',
  // parent: 'canvas', // <-- readd once css is setup for index page
  backgroundColor: '#000000',
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
    },
  },
  scene: [MainScene],
};

export const game = new Phaser.Game(config);
