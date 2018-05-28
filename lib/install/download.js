'use strict';

const KiteAPI = require('kite-api');
const {retryPromise} = require('kite-connect/lib/utils');

const BaseStep = require('./base-step');

module.exports = class Download extends BaseStep {
  start(state, install) {
    return KiteAPI.downloadKiteRelease({
      onDownloadProgress: (length, total, ratio) => {
        install.updateState({download: {length, total, ratio}});
      },
    })
    .then(() => {
      install.updateState({
        download: {done: true},
        install: {done: false},
      });
      return KiteAPI.installKite();
    })
    .then(() => retryPromise(() => KiteAPI.isKiteInstalled(), 10, 1500))
    .then(() => {
      install.updateState({
        install: {done: true},
        running: {done: false},
      });
      return KiteAPI.runKiteAndWait(30, 2500)
      .then(() => ({running: {done: true}}));
    });
  }
};
