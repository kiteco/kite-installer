'use strict';

const KiteAPI = require('kite-api');
const {retryPromise} = require('kite-connector/lib/utils');

const BaseStep = require('./base-step');

module.exports = class RunKiteWithCopilot extends BaseStep {
  constructor(options) {
    super(options);

    this.runInterval = 2500;
  }

  start(state, install) {
    return retryPromise(() => KiteAPI.isKiteInstalled(), 10, this.installInterval)
    .then(() => {
      return KiteAPI.runKiteWithCopilot()
      .then(() => {
        install.updateState({running: {done: true}});
      });
    });
  }
};
