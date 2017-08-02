'use strict';

const BaseStep = require('./base-step');
const StateController = require('../state-controller');

module.exports = class Whitelist extends BaseStep {
  start(state) {
    return new Promise((resolve, reject) => {
      this.view.onDidWhitelist(() => resolve(this.whitelist(state.path)));
      this.view.onDidSkipWhitelist(() => resolve({whitelist: 'skipped'}));
    });
  }

  whitelist(path) {
    return StateController.whitelistPath(path)
    .then(() => ({whitelist: 'complete'}));
  }
};
