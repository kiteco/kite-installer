'use strict';

const KiteAPI = require('kite-api');
const {retryPromise} = require('kite-connector/lib/utils');
const Metrics = require('../../ext/telemetry/metrics');

const BaseStep = require('./base-step');

module.exports = class Download extends BaseStep {
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
      return KiteAPI.installKite();
    })
    .then(() => retryPromise(() => KiteAPI.isKiteInstalled(), 10, 1500))
    .then(() => {
      Metrics.Tracker.trackEvent('kite_installer_kite_app_installed');
      install.updateState({
        install: {done: true},
        running: {done: false},
      });
      return KiteAPI.runKiteAndWait(30, 2500)
      .then(() => {
        Metrics.Tracker.trackEvent('kite_installer_kite_app_started');
        install.updateState({running: {done: true}});
      });
    });
  }
};
