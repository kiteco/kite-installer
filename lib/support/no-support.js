const KiteError = require('../kite-error');

const {STATES} = require('../constants');

module.exports = {
  get releaseURL() {
    return null;
  },

  get downloadPath() {
    return null;
  },

  get installPath() {
    return null;
  },

  get allInstallPath() {
    return null;
  },

  get enterpriseInstallPath() {
    return null;
  },

  get allEnterpriseInstallPath() {
    return null;
  },

  get sessionFilePath() {
    return null;
  },

  get localTokenPath() {
    return null;
  },

  hasManyKiteInstallation() {
    return false;
  },

  hasManyKiteEnterpriseInstallation() {
    return false;
  },

  isAdmin() {
    return false;
  },

  arch() {
    return null;
  },

  isOSSupported() {
    return false;
  },

  isOSVersionSupported() {
    return false;
  },

  isKiteSupported() {
    return false;
  },

  isKiteInstalled() {
    return this.notSupported();
  },

  installKite(opts) {
    return this.notSupported();
  },

  isKiteRunning() {
    return this.notSupported();
  },

  runKite() {
    return this.notSupported();
  },

  hasBothKiteInstalled() {
    return Promise.all([
      this.isKiteInstalled(),
      this.isKiteEnterpriseInstalled(),
    ]);
  },

  isKiteEnterpriseInstalled() {
    return this.notSupported();
  },

  isKiteEnterpriseRunning() {
    return this.notSupported();
  },

  runKiteEnterprise() {
    return this.notSupported();
  },

  notSupported() {
    return Promise.reject(
      new KiteError('bad_state', STATES.UNSUPPORTED));
  },
};
