const os = require('os');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const utils = require('../utils.js');
const KiteError = require('../kite-error');

const {STATES} = require('../constants');

const WindowsSupport = {
  RELEASE_URL: 'https://alpha.kite.com/release/dls/windows/current',
  KITE_INSTALLER_PATH: path.join(process.env.TMP, 'Kite.exe'),
  KITE_EXE_PATH: path.join(process.env.ProgramW6432, 'Kite', 'kited.exe'),

  get releaseURL() {
    return this.RELEASE_URL;
  },

  get downloadPath() {
    return this.KITE_INSTALLER_PATH;
  },

  get installPath() {
    return this.KITE_EXE_PATH;
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
    return fs.existsSync(this.KITE_EXE_PATH)
      ? Promise.resolve()
      : Promise.reject(new KiteError('bad_state', STATES.UNINSTALLED));
  },

  installKite(opts) {
    opts = opts || {};

    utils.guardCall(opts.onInstallStart);
    return utils.spawnPromise(this.KITE_INSTALLER_PATH)
    .then(() => utils.guardCall(opts.onCopy))
    .then(() => utils.spawnPromise('del', [
      this.KITE_INSTALLER_PATH,
    ], 'del_error'))
    .then(() => utils.guardCall(opts.onRemove));
  },

  isKiteRunning() {
    return utils.spawnPromise('tasklist', 'tasklist_error')
    .then(stdout => {
      const procs = stdout.split('\n');
      if (procs.indexOf('kited.exe') === -1) {
        throw new KiteError('bad_state', STATES.INSTALLED);
      }
    });
  },

  runKite() {
    return utils.spawnPromise(this.KITE_EXE_PATH);
  },
};

module.exports = WindowsSupport;
