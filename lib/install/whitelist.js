'use strict';

const BaseStep = require('./base-step');
const StateController = require('../state-controller');

module.exports = class Whitelist extends BaseStep {
  start(state, install) {
    return new Promise((resolve, reject) => {
      this.subscriptions.add(install.on('did-whitelist', () =>
        resolve(this.whitelist(state.path))));
      this.subscriptions.add(install.on('did-skip-whitelist', () =>
        resolve({whitelist: 'skipped'})));
    });
  }

  whitelist(path) {
    return StateController.whitelistPath(path)
    .then(() => ({whitelist: 'complete'}));
  }
};
