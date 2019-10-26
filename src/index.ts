import * as PIXI from 'pixi.js';

const app = new PIXI.Application();
document.body.appendChild(app.view);

const loader = app.loader.add('ship', 'assets/ship.gif');
loader.load((loader, resources) => {
  // app.stage.addChild(ship);

  const ship = new Ship();

  app.ticker.add(() => {
    const deltaMS = app.ticker.deltaMS;
    const delta = deltaMS / 1000;

    ship.update(delta);

    // ship.rotation += 1 * delta;
  });
});

interface GameObject {
  position: Vector;
  velocity: Vector;
  acceleration: Vector;

  update(delta: number): void;
}

class Ship implements GameObject {
  position = new Vector(0, 0);
  velocity = new Vector(0, 0);
  acceleration = new Vector(0, 0);

  constructor() {
    const ship = new PIXI.Sprite(app.loader.resources['ship']!.texture);
    ship.x = app.renderer.width / 2;
    ship.y = app.renderer.height / 2;
    ship.anchor.x = 0.5;
    ship.anchor.y = 0.5;
  }

  update(delta: number): void {}
}

class Vector {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

// let ticker = new PIXI.Ticker();
// let renderer = PIXI.autoDetectRenderer();
// let stage = new PIXI.Container();
// document.body.appendChild(renderer.view);
// ticker.add(function(time) {
//   renderer.render(stage);
// });
