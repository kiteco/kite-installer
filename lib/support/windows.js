const os = require('os');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const utils = require('../utils.js');
const KiteError = require('../kite-error');

const {STATES} = require('../constants');

const KEY_BAT = `"${path.join(__dirname, 'read-key.bat')}"`;
const ARCH_BAT = `"${path.join(__dirname, 'read-arch.bat')}"`;
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
  RELEASE_URL: 'https://s3-us-west-1.amazonaws.com/kite-downloads/windows/KiteSetup.exe',
  KITE_INSTALLER_PATH: path.join(os.tmpDir(), 'KiteSetup.exe'),
  KITE_EXE_PATH: path.join(findInstallPath(), 'kited.exe'),
  SESSION_FILE_PATH: path.join(process.env.LOCALAPPDATA, 'Kite', 'session.json'),

  get releaseURL() {
    return this.RELEASE_URL;
  },

  get downloadPath() {
    return this.KITE_INSTALLER_PATH;
  },

  get installPath() {
    return this.KITE_EXE_PATH;
  },

  get enterpriseInstallPath() {
    return null;
  },

  get allInstallPath() {
    return [this.installPath];
  },

  get allEnterpriseInstallPath() {
    return [];
  },

  get sessionFilePath() {
    return this.SESSION_FILE_PATH;
  },

  isAdmin() {
    return true;
    // try {
    //   child_process.execSync('net session');
    //   return true;
    // } catch (e) {
    //   return false;
    // }
  },

  arch() {
    if (this.cachedArch) { return this.cachedArch; }
    try {
      this.cachedArch = String(child_process.execSync(ARCH_BAT)).trim();
      return this.cachedArch;
    } catch (err) {
      return '';
    }
  },

  isOSSupported() {
    return true;
  },

  isOSVersionSupported() {
    return parseFloat(os.release()) >= 6.1 &&
           this.arch() === '64bit';
  },

  isKiteSupported() {
    return this.isOSVersionSupported();
  },

  isKiteInstalled() {
    return fs.existsSync(this.KITE_EXE_PATH)
      ? Promise.resolve()
      : Promise.reject(new KiteError('bad_state', STATES.UNINSTALLED));
  },

  isKiteEnterpriseInstalled() {
    return Promise.reject(new KiteError('bad_state', STATES.UNSUPPORTED));
  },

  hasManyKiteInstallation() {
    return this.allInstallPath.length > 1;
  },

  hasManyKiteEnterpriseInstallation() {
    return this.allEnterpriseInstallPath.length > 1;
  },

  hasBothKiteInstalled() {
    return Promise.all([
      this.isKiteInstalled(),
      this.isKiteEnterpriseInstalled(),
    ]);
  },

  installKite(opts) {
    opts = opts || {};
    var env = Object.create(process.env);
    env.KITE_SKIP_ONBOARDING = '1';

    utils.guardCall(opts.onInstallStart);
    return utils.execPromise(this.KITE_INSTALLER_PATH + ' --skip-onboarding', {env: env})
    .then(() => utils.guardCall(opts.onCopy))
    .then(() => fs.unlinkSync(this.KITE_INSTALLER_PATH))
    .then(() => utils.guardCall(opts.onRemove));
  },

  isKiteRunning() {
    return utils.spawnPromise('tasklist', 'tasklist_error')
    .then(stdout => {
      const procs = stdout.split('\n');
      if (procs.every(l => l.indexOf('kited.exe') === -1)) {
        throw new KiteError('bad_state', STATES.INSTALLED);
      }
    });
  },

  runKite() {
    var env = Object.create(process.env);
    env.KITE_SKIP_ONBOARDING = '1';
    child_process.spawn(this.KITE_EXE_PATH, {detached: true, env: env});
    return Promise.resolve();
  },

  isKiteEnterpriseRunning() {
    return Promise.reject(new KiteError('bad_state', STATES.UNSUPPORTED));
  },

  runKiteEnterprise() {
    return Promise.reject(new KiteError('bad_state', STATES.UNSUPPORTED));
  },
};

module.exports = WindowsSupport;
