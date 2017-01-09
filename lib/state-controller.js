'use strict';

const fs = require('fs');
const os = require('os');
const querystring = require('querystring');

const Client = require('./client.js');
const utils = require('./utils.js');

const StateController = {
  client: new Client('127.0.0.1', 46624, '', false),

  STATES: {
    UNSUPPORTED: 0,
    UNINSTALLED: 1,
    INSTALLED: 2,
    RUNNING: 3,
    REACHABLE: 4,
    AUTHENTICATED: 5,
    WHITELISTED: 6,
  },

  RELEASE_URLS: {
    darwin: 'https://alpha.kite.com/release/dls/mac/current',
  },
  APPS_PATH: '/Applications/',
  KITE_DMG_PATH: '/tmp/Kite.dmg',
  KITE_VOLUME_PATH: '/Volumes/Kite/',
  KITE_APP_PATH: {
    mounted: '/Volumes/Kite/Kite.app',
    installed: '/Applications/Kite.app',
  },
  KITE_SIDEBAR_PATH: '/Applications/Kite.app/Contents/MacOS/KiteSidebar.app',
  KITE_BUNDLE_ID: 'com.kite.Kite',

  downloadedStream: null,

  isKiteSupported() {
    return os.platform() === 'darwin' && os.release() >= '10.10.0'
      ? Promise.resolve()
      : Promise.reject({ type: 'bad_state', data: this.STATES.UNSUPPORTED });
  },

  isKiteInstalled() {
    return this.isKiteSupported()
    .then(() => {
      if (!fs.existsSync(this.KITE_APP_PATH.installed)) {
        throw { type: 'bad_state', data: this.STATES.UNINSTALLED };
      }
    });
  },

  canInstallKite() {
    return this.isKiteSupported()
    .then(() =>
      utils.reversePromise(this.isKiteInstalled(), {
        type: 'bad_state',
        data: this.STATES.INSTALLED,
      }));
  },

  downloadKite(url, opts) {
    opts = opts || {};
    return this.canInstallKite()
    .then(() => utils.spawnPromise('curl', [
      '-L', url, '--output', this.KITE_DMG_PATH,
    ], 'curl_error'))
    .then(() => utils.guardCall(opts.onDownload))
    .then(() => opts.install && this.installKite(opts));
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
    return this.isKiteInstalled()
    .then(() =>
      utils.spawnPromise('/bin/ps', [
        '-axco', 'command',
      ], {
        encoding: 'utf8',
      }, 'unmount_error'))
    .then(stdout => {
      const procs = stdout.split('\n');
      if (procs.indexOf('Kite') === -1) {
        throw { type: 'bad_state', data: this.STATES.INSTALLED };
      }
    });
  },

  canRunKite() {
    return this.isKiteInstalled()
    .then(() =>
      utils.reversePromise(this.isKiteRunning(), {
        type: 'bad_state',
        data: this.STATES.RUNNING,
      }));
  },

  runKite() {
    return this.canRunKite()
    .then(() =>
      utils.spawnPromise('defaults', [
        'write', 'com.kite.Kite', 'shouldReopenSidebar', '0',
      ]))
    .then(() =>
      utils.spawnPromise('open', ['-a', this.KITE_APP_PATH.installed]));
  },

  isKiteReachable() {
    return this.isKiteRunning()
    .then(() =>
      this.client.request({
        path: '/system',
        method: 'GET',
      }).catch(err => {
        throw { type: 'bad_state', data: this.STATES.RUNNING };
      }));
  },

  waitForKite(attempts, interval) {
    return utils.retryPromise(() => this.isKiteReachable(), attempts, interval);
  },

  runKiteAndWait(attempts, interval) {
    return this.runKite().then(() => this.waitForKite(attempts, interval));
  },

  isUserAuthenticated() {
    return this.isKiteReachable()
    .then(() =>
      this.client.request({
        path: '/api/account/authenticated',
        method: 'GET',
      }).catch(err => {
        throw { type: 'http_error', data: err };
      }))
    .then((resp) => {
      switch (resp.statusCode) {
        case 200:
          utils.handleResponseData(resp, (data) => {
            if (data !== 'authenticated') {
              throw { type: 'bad_state', data: this.STATES.REACHABLE };
            }
          });
          break;
        case 401:
          throw { type: 'bad_state', data: this.STATES.REACHABLE };
        default:
          throw { type: 'bad_status', data: resp.statusCode };
      }
    });
  },

  canAuthenticateUser() {
    return this.isKiteReachable();
  },

  authenticateUser(email, password) {
    return this.canAuthenticateUser().then(() => {
      const content = querystring.stringify({email, password});
      return this.client.request({
        path: '/api/account/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(content),
        },
      }, content)
      .catch(err => { throw { type: 'http_error', data: err }; });
    })
    .then(resp => {
      switch (resp.statusCode) {
        case 200:
          break;
        case 401:
        case 400:
          throw { type: 'unauthorized' };
        default:
          throw { type: 'bad_status', data: resp.statusCode };
      }
    });
  },

  authenticateSessionID: function(key) {
    var handle = (resp, resolve, reject) => {
      switch (resp.statusCode) {
        case 200:
          resolve();
          break;
        case 401:
        case 400:
          reject({ type: 'unauthorized' });
          break;
        default:
          reject({ type: 'bad_status', data: resp.statusCode });
      }
    };

    return new Promise((resolve, reject) => {
      this.canAuthenticateUser().then(() => {
        var content = querystring.stringify({ key: key });
        var req = this.client.request({
          path: '/api/account/authenticate',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(content),
          },
        }, (resp) => handle(resp, resolve, reject), content);
        req.on('error', (err) => {
          reject({ type: 'http_error', data: err });
        });
      }, (err) => {
        reject(err);
      });
    });
  },

  isPathWhitelisted: function(path) {
    var handle = (resp, resolve, reject) => {
      if (resp.statusCode !== 200) {
        reject({ type: 'bad_status', data: resp.statusCode });
      }
      utils.handleResponseData(resp, (data) => {
        var whitelisted = false;
        try {
          var dirs = JSON.parse(data);
          for (var i = 0; i < dirs.length; i++) {
            if (path.indexOf(dirs[i]) === 0) {
              whitelisted = true;
              break;
            }
          }
        } catch (e) {
          whitelisted = false;
        }
        if (whitelisted) {
          resolve();
        } else {
          reject({ type: 'bad_state', data: this.STATES.AUTHENTICATED });
        }
      });
    };

    return new Promise((resolve, reject) => {
      this.isUserAuthenticated().then(() => {
        var req = this.client.request({
          path: '/clientapi/settings/inclusions',
          method: 'GET',
        }, (resp) => handle(resp, resolve, reject));
        req.on('error', (err) => {
          reject({ type: 'http_error', data: err });
        });
      }, (err) => {
        reject(err);
      });
    });
  },

  canWhitelistPath: function(path) {
    return new Promise((resolve, reject) => {
      this.isUserAuthenticated().then(() => {
        this.isPathWhitelisted(path).then(() => {
          reject({ type: 'bad_state', data: this.STATES.WHITELISTED });
        }, (err) => {
          resolve();
        });
      }, (err) => {
        reject(err);
      });
    });
  },

  whitelistPath: function(path) {
    var handle = (resp, resolve, reject) => {
      if (resp.statusCode !== 200) {
        reject({ type: 'bad_status', data: resp.statusCode });
      } else {
        resolve();
      }
    };

    return new Promise((resolve, reject) => {
      this.canWhitelistPath(path).then(() => {
        var content = querystring.stringify({
          inclusions: path,
        });
        var req = this.client.request({
          path: '/clientapi/settings/inclusions',
          method: 'PUT',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(content),
          },
        }, (resp) => handle(resp, resolve, reject), content);
        req.on('error', (err) => {
          reject({ type: 'http_error', data: err });
        });
      }, (err) => {
        reject(err);
      });
    });
  },

  handleState: function(path) {
    return new Promise((resolve, reject) => {
      this.isPathWhitelisted(path).then(() => {
        resolve(this.STATES.WHITELISTED);
      }, (err) => {
        if (err.type === 'bad_state') {
          resolve(err.data);
        } else {
          reject(err);
        }
      });
    });
  },

  get releaseURL() {
    return this.RELEASE_URLS[os.platform()];
  },

  downloadKiteRelease: function(opts) {
    opts = opts || {};
    return this.downloadKite(this.releaseURL, opts);
  },
};

module.exports = StateController;
