'use strict';

const sinon = require('sinon');
const BaseStep = require('../../lib/install/base-step');

module.exports = class DummyStep extends BaseStep {
  constructor(action, options) {
    if (typeof action == 'object') {
      ([action, options] = [options, action]);
    }
    super(options);
    this.action = action;
    sinon.spy(this, 'start');
  }

  start(state, install) {
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
      this.action && this.action(this, state, install);
    });
  }
};
