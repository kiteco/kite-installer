'use strict';

const BaseStep = require('./base-step');

module.exports = class InputEmail extends BaseStep {
  start(state, install) {
    return new Promise((resolve, reject) => {
      this.subscriptions.add(install.on('did-submit-email', data => {
        resolve({account: data});
      }));

      this.subscriptions.add(install.on('did-skip-email', data => {
        resolve({account: data});
      }))
    });
  }
};
