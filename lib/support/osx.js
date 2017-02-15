const os = require('os');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const utils = require('../utils.js');
const KiteError = require('../kite-error');
const {STATES} = require('../constants');

const OSXSupport = {
  RELEASE_URL: 'https://alpha.kite.com/release/dls/mac/current',
  APPS_PATH: '/Applications/',
  KITE_DMG_PATH: '/tmp/Kite.dmg',
  KITE_VOLUME_PATH: '/Volumes/Kite/',
  KITE_APP_PATH: {
    mounted: '/Volumes/Kite/Kite.app',
    installed: '/Applications/Kite.app',
  },
  KITE_SIDEBAR_PATH: '/Applications/Kite.app/Contents/MacOS/KiteSidebar.app',
  KITE_BUNDLE_ID: 'com.kite.Kite',
  SESSION_FILE_PATH: path.join(os.homedir(), '.kite', 'session.json'),
  LOCAL_TOKEN_PATH: path.join(os.homedir(), '.kite', 'localtoken'),

  get releaseURL() {
    return this.RELEASE_URL;
  },

  get downloadPath() {
    return this.KITE_DMG_PATH;
  },

  get installPath() {
    return this.KITE_APP_PATH.installed;
  },

  get sessionFilePath() {
    return this.SESSION_FILE_PATH;
  },

  get localTokenPath() {
    return this.LOCAL_TOKEN_PATH;
  },

  isAdmin() {
    try {
      const user = String(child_process.execSync('whoami')).trim();
      const adminUsers = String(child_process.execSync('dscacheutil -q group -a name admin'))
      .split('\n')
      .filter(l => /^users:/.test(l))[0]
      .trim()
      .replace(/users:\s+/, '')
      .split(/\s/g);
      return adminUsers.includes(user);
    } catch (e) {
      return false;
    }
  },

  arch() {
    return os.arch();
  },

  isOSSupported() {
    return true;
  },

  isOSVersionSupported() {
    return parseFloat(os.release()) >= 14;
  },

  isKiteSupported() {
    return this.isOSVersionSupported();
  },

  isKiteInstalled() {
    return fs.existsSync(this.KITE_APP_PATH.installed)
      ? Promise.resolve()
      : Promise.reject(new KiteError('bad_state', STATES.UNINSTALLED));
  },

  installKite(opts) {
    opts = opts || {};

    utils.guardCall(opts.onInstallStart);
    return utils.spawnPromise('hdiutil', [
      'attach', '-nobrowse', this.KITE_DMG_PATH,
    ], 'mount_error')
    .then(() => utils.guardCall(opts.onMount))
    .then(() => utils.spawnPromise('cp', [
      '-r', this.KITE_APP_PATH.mounted, this.APPS_PATH,
    ], 'cp_error'))
    .then(() => utils.guardCall(opts.onCopy))
    .then(() => utils.spawnPromise('hdiutil', [
      'detach', this.KITE_VOLUME_PATH,
    ], 'unmount_error'))
    .then(() => utils.guardCall(opts.onUnmount))
    .then(() => utils.spawnPromise('rm', [
      this.KITE_DMG_PATH,
    ], 'rm_error'))
    .then(() => utils.guardCall(opts.onRemove));
  },

  isKiteRunning() {
    return utils.spawnPromise('/bin/ps', [
      '-axco', 'command',
    ], {
      encoding: 'utf8',
    }, 'ps_error')
    .then(stdout => {
      const procs = stdout.split('\n');
      if (procs.indexOf('Kite') === -1) {
        throw new KiteError('bad_state', STATES.INSTALLED);
      }
    });
  },

  runKite() {
    return utils.spawnPromise('defaults', [
      'write', 'com.kite.Kite', 'shouldReopenSidebar', '0',
    ])
    .then(() =>
      utils.spawnPromise('open', ['-a', this.KITE_APP_PATH.installed]));
  },
};

module.exports = OSXSupport;
