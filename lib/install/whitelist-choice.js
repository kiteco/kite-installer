'use strict';

const BaseStep = require('./base-step');

module.exports = class WhitelistChoice extends BaseStep {
  start(state, install) {
    return new Promise((resolve, reject) => {
      this.subscriptions.add(install.on('did-whitelist', () => {
        install.updateState({whitelist: state.path});
        resolve();
      }));
      this.subscriptions.add(install.on('did-skip-whitelist', () => {
        install.updateState({whitelist: 'skipped'});
        resolve();
      }));
    });
  }
};
