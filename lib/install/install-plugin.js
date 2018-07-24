'use strict';

const BaseStep = require('./base-step');
const AtomHelper = require('../atom-helper');
const Metrics = require('../../ext/telemetry/metrics');

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
    .then(() => {
      Metrics.Tracker.trackEvent('kite_installer_kite_plugin_installed');
      install.updateState({plugin: {done: true}});
    });
  }
};
