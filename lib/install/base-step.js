'use strict';

module.exports = class BaseStep {
  constructor(options = {}) {
    this.name = options.name;
    this.retryStep = options.retryStep;
    this.view = options.view;
  }
};
