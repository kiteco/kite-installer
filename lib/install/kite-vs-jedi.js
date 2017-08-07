'use strict';

const BaseStep = require('./base-step');

module.exports = class KiteVsJedi extends BaseStep {
  start(state, install) {
    return new Promise((resolve, reject) => {
      install.on('did-pick-install', () => resolve());
      install.on('did-skip-install', () => install.destroy());
    });
  }
};
