import {Game} from './game';
import {loadAssets} from './resources';

loadAssets().then(() => {
  const game = new Game();
  game.start();
});
