'use strict';

const BaseStep = require('./base-step');
const KiteAPI = require('kite-api');
const {retryPromise} = require('kite-connector/lib/utils');
const Metrics = require('../../ext/telemetry/metrics');

module.exports = class Authenticate extends BaseStep {
  constructor(options = {}) {
    super(options);
    this.cooldown = options.cooldown || 1500;
    this.tries = options.tries || 10;
  }
  start(state, install) {
    install.updateState({authenticate: {done: false}});

    let promise;

    if (!state.account || !state.account.sessionId) {
      promise = Promise.resolve();
    } else {
      promise = retryPromise(() => KiteAPI.authenticateSessionID(state.account.sessionId), this.tries, this.cooldown);
    }

    return promise.then(() => {
      Metrics.Tracker.trackEvent('kite_installer_user_authenticated');
      install.updateState({authenticate: {done: true}});
    });
  }
};
