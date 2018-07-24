'use strict';

const KiteAPI = require('kite-api');
const BaseStep = require('./base-step');

module.exports = class Whitelist extends BaseStep {
  start(state, install) {
    return state.whitelist === 'skipped' || !state.path
      ? Promise.resolve()
      : KiteAPI.whitelistPath(state.path)
        .then(() => ({whitelist: 'complete'}))
        .catch(err => {
          if (err.data !== KiteAPI.STATES.WHITELISTED) {
            throw err;
          } else {
            return {whitelist: 'complete'};
          }
        });
  }
};
