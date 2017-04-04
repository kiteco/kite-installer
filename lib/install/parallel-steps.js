'use strict';

module.exports = class ParallelSteps {
  constructor(steps) {
    this.steps = steps;
  }

  start() {
    return Promise.all(this.steps.map(step => step.start()));
  }
};
