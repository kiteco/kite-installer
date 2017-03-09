'use strict';

module.exports = class Install {
  constructor(steps) {
    this.steps = steps;
  }

  start() {
    return this.steps.reduce(
      (promise, step) => promise.then(data => step.start(data)),
      Promise.resolve());
  }
};
