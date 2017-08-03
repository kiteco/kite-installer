'use strict';

const BaseStep = require('./base-step');
const AtomHelper = require('../atom-helper');

module.exports = class InstallPlugin extends BaseStep {
  start(state, install) {
    install.updateState({plugin: {done: false}});
    return AtomHelper.installPackage()
    .then(() => new Promise((resolve) => {
      setTimeout(() => {
        AtomHelper.activatePackage();
        resolve();
      }, 200);
    }))
    .then(() => ({plugin: {done: true}}));
  }
};
