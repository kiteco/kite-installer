'use strict';

const BaseStep = require('./base-step');

module.exports = class VoidStep extends BaseStep {
  constructor(options, action) {
    super(options);
    this.action = action;
  }
  start() {
    this.action && this.action();
    return new Promise(() => {});
  }
};
