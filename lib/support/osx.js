const os = require('os');
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
  KITE_APP_PATH: {mounted: '/Volumes/Kite/Kite.app'},
  KITE_SIDEBAR_PATH: '/Applications/Kite.app/Contents/MacOS/KiteSidebar.app',
  KITE_BUNDLE_ID: 'com.kite.Kite',
  SESSION_FILE_PATH: path.join(os.homedir(), '.kite', 'session.json'),

  get releaseURL() {
    return this.RELEASE_URL;
  },

  get downloadPath() {
    return this.KITE_DMG_PATH;
  },

  get installPath() {
    return this.allInstallPath[0];
  },

  get allInstallPath() {
    return String(child_process.spawnSync('mdfind', [
      'kMDItemCFBundleIdentifier = "com.kite.Kite"',
    ]).stdout).trim().split('\n');
  },

  get enterpriseInstallPath() {
    return this.allEnterpriseInstallPath[0];
  },

  get allEnterpriseInstallPath() {
    return String(child_process.spawnSync('mdfind', [
      'kMDItemCFBundleIdentifier = "enterprise.kite.Kite"',
    ]).stdout).trim().split('\n');
  },

  get sessionFilePath() {
    return this.SESSION_FILE_PATH;
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
    return utils.spawnPromise('mdfind', ['kMDItemCFBundleIdentifier = "com.kite.Kite"'])
    .then(res => {
      if (!res || res.trim() === '') {
        throw new KiteError('bad_state', STATES.UNINSTALLED);
      }
    })
    .catch(() => {
      throw new KiteError('bad_state', STATES.UNINSTALLED);
    });
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

  isKiteEnterpriseInstalled() {
    return utils.spawnPromise('mdfind', ['kMDItemCFBundleIdentifier = "enterprise.kite.Kite"'])
    .then(res => {
      if (!res || res.trim() === '') {
        throw new KiteError('bad_state', STATES.UNINSTALLED);
      }
    })
    .catch(() => {
      throw new KiteError('bad_state', STATES.UNINSTALLED);
    });
  },

  installKite(opts) {
    // mdfind takes some time to index the app location, so we need to
    // wait for the install to fully complete. Runs 10 times at 1.5s
    // intervals.
    var completeInstall = () => {
      return utils.retryPromise(() => this.isKiteInstalled(), 10, 1500);
    };

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
    .then(() => utils.guardCall(opts.onRemove))
    .then(() => completeInstall());
  },

  isKiteRunning() {
    return utils.spawnPromise('/bin/ps', [
      '-axco', 'command',
    ], {
      encoding: 'utf8',
    }, 'ps_error')
    .then(stdout => {
      const procs = stdout.split('\n');
      if (!procs.some(s => /^Kite$/.test(s))) {
        throw new KiteError('bad_state', STATES.INSTALLED);
      }
    });
  },

  runKite() {
    return utils.spawnPromise('defaults', [
      'write', 'com.kite.Kite', 'shouldReopenSidebar', '0',
    ])
    .then(() =>
      utils.spawnPromise('open', ['-a', this.installPath]));
  },

  isKiteEnterpriseRunning() {
    return utils.spawnPromise('/bin/ps', [
      '-axco', 'command',
    ], {
      encoding: 'utf8',
    }, 'ps_error')
    .then(stdout => {
      const procs = stdout.split('\n');
      if (!procs.some(s => /^KiteEnterprise$/.test(s))) {
        throw new KiteError('bad_state', STATES.INSTALLED);
      }
    });
  },

  runKiteEnterprise() {
    return utils.spawnPromise('defaults', [
      'write', 'enterprise.kite.Kite', 'shouldReopenSidebar', '0',
    ])
    .then(() =>
      utils.spawnPromise('open', ['-a', this.enterpriseInstallPath]));
  },
};

module.exports = OSXSupport;
