import {Updatable} from '../models/models';
import {randomInt} from './random';

/**
 * A utility class that can trigger function(s) so many times per second as
 * part of the update() pass. Useful for introducing rate limits on particular
 * actions.
 *
 * For example:
 *
 *  (1) Fire bullets at most 6 times per second
 *  (2) Search for a new target once every 10 seconds
 */
class Interval implements Updatable {
  targets: Function[] = [];

  /** A threshold that will trigger the interval when reached. */
  private limit = 1;

  /** The counter incremented ever update */
  private count = 0;

  /** How much to increment every update */
  private delta = 1;

  private triggerNext = false;

  constructor(timesPerSecond: number, randomize?: boolean) {
    if (randomize) {
      this.count = randomInt(0, 100);
    }

    this.limit = 1 / timesPerSecond;
  }

  /**
   * Randomizes the intervals progress.
   */
  randomize() {
    this.count = randomInt(0, 100);
  }

  triggerOnNextUpdate() {
    this.triggerNext = true;
  }

  /**
   * Returns how close the update is to being triggered as
   * a percentage value (0 to 1).
   */
  percent() {
    return this.count / this.limit;
  }

  /**
   * Return true if the interval will be triggered next update.
   */
  isReady() {
    return this.count >= this.limit;
  }

  update(delta: number) {
    this.count += delta;
    this.trigger();
  }

  trigger() {
    while (this.count >= this.limit || this.triggerNext) {
      this.count -= this.limit;
      this.triggerNext = false;
      for (const target of this.targets) {
        target();
      }
    }
  }

  /**
   * Registers a new callback to be triggered when the interval is reached.
   */
  addTarget(fn: Function) {
    this.targets.push(fn);
    return this;
  }
}
