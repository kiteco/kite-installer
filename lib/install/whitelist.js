'use strict';

const BaseStep = require('./base-step');
const StateController = require('../state-controller');

module.exports = class Whitelist extends BaseStep {
  start(state, install) {
    return state.whitelist === 'skipped'
      ? Promise.resolve()
      : StateController.whitelistPath(state.path)
        .then(() => ({whitelist: 'complete'}))
        .catch(err => {
          if (!err.data !== StateController.STATES.WHITELISTED) {
            throw err;
          }
        });
  }
};
