'use strict';

const BaseStep = require('./base-step');
const {deepMerge} = require('kite-connector/lib/utils');

module.exports = class ParallelSteps extends BaseStep {
  constructor(steps, options) {
    super(options);
    this.steps = steps;
  }

  start(state, install) {
    return Promise.all(this.steps.map(step => step.start(state, install)))
    .then((results) => {
      return results.reduce((memo, o) => {
        return o ? deepMerge(memo, o) : memo;
      });
    });
  }

  getView() {
    return this.view || this.steps.map(s => s.view).filter(s => s)[0];
  }
};
