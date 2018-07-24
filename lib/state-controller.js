'use strict';

const KiteAPI = require('kite-api');
const KiteConnector = require('kite-connector');
const {STATES} = require('kite-connector/lib/constants');

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

  /*
    The old client.request method was not failing due to invalid status code
    so we're just returning the response in that case so that the legacy
    code can continue working until we decide to change it completely.
  */
  client: {
    request(...args) {
      return KiteAPI.request(...args).catch(err => {
        if (err.resp) {
          return err.resp;
        }
        throw err;
      });
    },
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
