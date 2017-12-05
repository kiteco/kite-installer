'use strict';

const BaseStep = require('./base-step');
const StateController = require('../state-controller');
const {retryPromise} = require('../utils');

module.exports = class Download extends BaseStep {
  start(state, install) {
    return StateController.downloadKiteRelease({
      onDownloadProgress: (length, total, ratio) => {
        install.updateState({download: {length, total, ratio}});
      },
    })
    .then(() => {
      install.updateState({
        download: {done: true},
        install: {done: false},
      });
      return StateController.installKite();
    })
    .then(() => retryPromise(() => StateController.isKiteInstalled(), 10, 1500))
    .then(() => {
      install.updateState({
        install: {done: true},
        running: {done: false},
      });
      return StateController.runKiteAndWait(30, 2500)
      .then(() => ({running: {done: true}}));
    });
  }
};
