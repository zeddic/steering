import {Game} from './game';
import {createGameLoader} from './resources';

const loader = createGameLoader();

loader.load(() => {
  const game = new Game(loader);
  game.start();
});
