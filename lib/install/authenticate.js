'use strict';

const KiteAPI = require('kite-api');
const BaseStep = require('./base-step');
const {retryPromise} = require('kite-connector/lib/utils');

module.exports = class Authenticate extends BaseStep {
  constructor(options = {}) {
    super(options);
    this.cooldown = options.cooldown || 1500;
    this.tries = options.tries || 10;
  }
  start(state, install) {
    if (!state.account || !state.account.sessionId) {
      return Promise.reject();
    }

    return retryPromise(() =>
      KiteAPI.authenticateSessionID(state.account.sessionId), this.tries, this.options.cooldown)
    .then(() =>
      retryPromise(() => KiteAPI.isUserAuthenticated(), this.tries, this.options.cooldown))
    .then(() => {});
  }
};
