const os = require('os');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const utils = require('../utils.js');
const KiteError = require('../kite-error');

const {STATES} = require('../constants');

const KEY_BAT = path.join(__dirname, 'read-key.bat');
const ARCH_BAT = path.join(__dirname, 'read-arch.bat');
const FALLBACK_INSTALL_PATH = path.join(process.env.ProgramW6432, 'Kite');

function findInstallPath() {
  try {
    const registryPath = String(child_process.execSync(KEY_BAT)).trim();

    return registryPath !== 'not found'
      ? registryPath
      : FALLBACK_INSTALL_PATH;
  } catch (err) {
    return FALLBACK_INSTALL_PATH;
  }
}

const WindowsSupport = {
  RELEASE_URL: 'https://alpha.kite.com/release/dls/windows/current',
  KITE_INSTALLER_PATH: path.join(process.env.TMP, 'Kite.exe'),
  KITE_EXE_PATH: path.join(findInstallPath(), 'kited.exe'),
  SESSION_FILE_PATH: path.join(process.env.LOCALAPPDATA, '.kite', 'session.json'),
  LOCAL_TOKEN_PATH: path.join(process.env.LOCALAPPDATA, '.kite', 'localtoken'),

  get releaseURL() {
    return this.RELEASE_URL;
  },

  get downloadPath() {
    return this.KITE_INSTALLER_PATH;
  },

  get installPath() {
    return this.KITE_EXE_PATH;
  },

  get sessionFilePath() {
    return this.SESSION_FILE_PATH;
  },

  get localTokenPath() {
    return this.LOCAL_TOKEN_PATH;
  },

  isAdmin() {
    try {
      child_process.execSync('net session');
      return true;
    } catch (e) {
      return false;
    }
  },

  arch() {
    return String(child_process.execSync(KEY_BAT)).trim();
  },

  isKiteSupported() {
    return parseFloat(os.release()) >= 6.1 &&
           this.arch() === '64bit';
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
    .then(() => fs.unlinkSync(this.KITE_INSTALLER_PATH))
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
