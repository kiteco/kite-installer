'use strict';

module.exports = class ParallelSteps {
  constructor(steps, {name, retryStep} = {}) {
    this.name = name;
    this.retryStep = retryStep;
    this.steps = steps;
  }

  start() {
    return Promise.all(this.steps.map(step => step.start()));
  }
};
