'use strict';

const BaseStep = require('./base-step');
const StateController = require('../state-controller');

module.exports = class Download extends BaseStep {
  start(state, install) {
    return StateController.downloadKiteRelease({
      install: true,
      onDownloadProgress: (length, total, ratio) => {
        install.updateState({install: {length, total, ratio}});
      },
    }).then(() => {
      return {
        install: {done: true},
      };
    }).catch(err => {
      err.data = {
        install: {
          done: false,
        },
      };
      throw err;
    });
  }
};
