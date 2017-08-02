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

  getView() {
    return this.view || this.steps.map(s => s.view).filter(s => s)[0];
  }
};
