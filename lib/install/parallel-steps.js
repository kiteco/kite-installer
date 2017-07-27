'use strict';

const BaseStep = require('./base-step');

module.exports = class ParallelSteps extends BaseStep {
  constructor(steps, options) {
    super(options);
    this.steps = steps;
  }

  start() {
    return Promise.all(this.steps.map(step => step.start()));
  }
};
