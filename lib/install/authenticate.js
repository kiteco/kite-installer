'use strict';

const BaseStep = require('./base-step');
const StateController = require('../state-controller');
const {retryPromise} = require('../utils');

module.exports = class Authenticate extends BaseStep {
  start(state, install) {
    return retryPromise(() =>
      StateController.authenticateSessionID(state.account.sessionId), 10, 1500)
    .then(() =>
      retryPromise(() => StateController.isUserAuthenticated(), 10, 1500));
  }
};
