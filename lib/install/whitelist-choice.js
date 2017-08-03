'use strict';

const BaseStep = require('./base-step');

module.exports = class WhitelistChoice extends BaseStep {
  start(state, install) {
    return new Promise((resolve, reject) => {
      this.subscriptions.add(install.on('did-whitelist', () => {
        resolve({whitelist: state.path});
      }));
      this.subscriptions.add(install.on('did-skip-whitelist', () =>
        resolve({whitelist: 'skipped'})));
    });
  }
};
