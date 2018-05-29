'use strict';

const KiteAPI = require('kite-api');
const KiteConnector = require('kite-connect');
const {STATES} = require('kite-connect/lib/constants');

const StateController = {
  STATES,

  get support() {
    return KiteConnector.adapter;
  },

  get releaseURL() {
    return this.support.releaseURL;
  },

  get downloadPath() {
    return this.support.downloadPath;
  },

  get installPath() {
    return this.support.installPath;
  },
};

[
  ['handleState', 'checkHealth'],
  ['pathInWhitelist', 'isPathWhitelisted'],
].forEach(([a, b]) => {
  StateController[a] = (...args) => KiteAPI[b](...args);
});

[
  'arch',
  'isAdmin',
  'isOSSupported',
  'isOSVersionSupported',
  'hasManyKiteInstallation',
  'hasManyKiteEnterpriseInstallation',
  'hasBothKiteInstalled',
].forEach(method => {
  StateController[method] = (...args) => KiteConnector.adapter[method](...args);
});

[
  'isKiteSupported',
  'isKiteInstalled',
  'isKiteEnterpriseInstalled',
  'canInstallKite',
  'downloadKiteRelease',
  'downloadKite',
  'installKite',
  'isKiteRunning',
  'canRunKite',
  'runKite',
  'runKiteAndWait',
  'isKiteEnterpriseRunning',
  'canRunKiteEnterprise',
  'runKiteEnterprise',
  'runKiteEnterpriseAndWait',
  'isKiteReachable',
  'waitForKite',
  'isUserAuthenticated',
  'canAuthenticateUser',
  'authenticateUser',
  'authenticateSessionID',
  'isPathWhitelisted',
  'canWhitelistPath',
  'whitelistPath',
  'blacklistPath',
  'saveUserID',
].forEach(method => {
  StateController[method] = (...args) => KiteAPI[method](...args);
});

module.exports = StateController;
