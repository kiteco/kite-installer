'use strict';

const KiteAPI = require('kite-api');
const {retryPromise} = require('kite-connector/lib/utils');

const BaseStep = require('./base-step');

module.exports = class LaunchCopilot extends BaseStep {
  constructor(options) {
    super(options);

    this.runInterval = 2500;
  }

  start(state, install) {
    return retryPromise(() => KiteAPI.isKiteInstalled(), 10, this.installInterval)
    .then(() => {
      return KiteAPI.runKiteAndWait(30, this.runInterval, true)
      .then(() => {
        install.updateState({running: {done: true}});
      });
    });
  }
};
