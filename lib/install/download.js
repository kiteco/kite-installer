'use strict';

const KiteAPI = require('kite-api');
const {retryPromise} = require('kite-connector/lib/utils');
const Metrics = require('../../ext/telemetry/metrics');

const BaseStep = require('./base-step');

module.exports = class Download extends BaseStep {
  constructor(options) {
    super(options);

    this.installInterval = 1500;
    this.runInterval = 2500;
  }

  start(state, install) {
    return KiteAPI.downloadKiteRelease({
      reinstall: true,
      onDownloadProgress: (length, total, ratio) => {
        install.updateState({download: {length, total, ratio}});
      },
    })
    .then(() => {
      Metrics.Tracker.trackEvent('kite_installer_kite_app_downloaded');
      install.updateState({
        download: {done: true},
        install: {done: false},
      });
      return retryPromise(() => KiteAPI.installKite(), 5, this.installInterval);
    })
    .then(() => retryPromise(() => KiteAPI.isKiteInstalled(), 10, this.installInterval))
    .then(() => {
      Metrics.Tracker.trackEvent('kite_installer_kite_app_installed');
      install.updateState({
        install: {done: true},
        running: {done: false},
      });
      return KiteAPI.runKiteAndWait(30, this.runInterval)
      .then(() => {
        Metrics.Tracker.trackEvent('kite_installer_kite_app_started');
        install.updateState({running: {done: true}});
      });
    });
  }
};
