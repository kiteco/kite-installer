'use strict';

const BaseStep = require('./base-step');
const StateController = require('../state-controller');

module.exports = class Download extends BaseStep {
  start(state, install) {
    return StateController.downloadKiteRelease({
      install: true,
      onDownloadProgress: (length, total, ratio) => {
        install.updateState({download: {length, total, ratio}});
      },
    }).then(() => {
      return {
        download: {done: true},
      };
    }).catch(err => {
      err.data = {
        download: {
          done: false,
        },
      };
      throw err;
    });
  }
};
