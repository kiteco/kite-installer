const os = require('os');
const child_process = require('child_process');
const KiteError = require('../kite-error');

const {STATES} = require('../constants');

const WindowsSupport = {
  get releaseURL() {
    return null;
  },

  get downloadPath() {
    return null;
  },

  isAdmin() {
    try {
      child_process.execSync('net session');
      return true;
    } catch (e) {
      return false;
    }
  },

  isKiteSupported() {
    return parseFloat(os.release()) >= 6.1 && os.arch() === 'x64';
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

  notSupported() {
    return Promise.reject(
      new KiteError('bad_state', STATES.UNSUPPORTED));
  },
};

module.exports = WindowsSupport;
