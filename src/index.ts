import * as PIXI from 'pixi.js';

const app = new PIXI.Application();
document.body.appendChild(app.view);

app.loader.add('ship', 'assets/ship.gif').load((loader, resources) => {
  const ship = new PIXI.Sprite(resources['ship']!.texture);
  ship.x = app.renderer.width / 2;
  ship.y = app.renderer.height / 2;

  // Rotate around the center
  ship.anchor.x = 0.5;
  ship.anchor.y = 0.5;

  app.stage.addChild(ship);

  app.ticker.add(() => {
    ship.rotation += 0.01;
  });
});
