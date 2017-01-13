'use strict';

const fs = require('fs');
const os = require('os');
const querystring = require('querystring');
const https = require('https');

const Client = require('./client.js');
const KiteError = require('./kite-error');
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

  get releaseURL() {
    return this.RELEASE_URLS[os.platform()];
  },

  handleState(path) {
    return this.isPathWhitelisted(path)
    .then(() => this.STATES.WHITELISTED)
    .catch(err => {
      if (err.type !== 'bad_state') { throw err; }
      return err.data;
    });
  },

  isKiteSupported() {
    return os.platform() === 'darwin' && os.release() >= '10.10.0'
      ? Promise.resolve()
      : Promise.reject({ type: 'bad_state', data: this.STATES.UNSUPPORTED });
  },

  isKiteInstalled() {
    return this.isKiteSupported()
    .then(() => {
      if (!fs.existsSync(this.KITE_APP_PATH.installed)) {
        throw new KiteError('bad_state', this.STATES.UNINSTALLED);
      }
    });
  },

  canInstallKite() {
    return this.isKiteSupported()
    .then(() =>
      utils.reversePromise(this.isKiteInstalled(),
        new KiteError('bad_state', this.STATES.INSTALLED)));
  },

  downloadKiteRelease(opts) {
    return this.downloadKite(this.releaseURL, opts || {});
  },

  downloadKite(url, opts) {
    opts = opts || {};
    return this.canInstallKite()
    .then(() => this.streamKiteDownload())
    .then(() => utils.guardCall(opts.onDownload))
    .then(() => opts.install && this.installKite(opts));
  },

  streamKiteDownload() {
    const req = https.request(this.releaseURL);
    req.end();

    return utils.promisifyRequest(req)
    .then(resp => {
      if (resp.statusCode === 303) {
        const req = https.request(resp.headers.location);
        req.end();
        return utils.promisifyRequest(req);

      } else {
        throw new KiteError('bad_status', resp.statusCode);
      }
    })
    .then(resp => {
      const total = parseInt(resp.headers['content-length'], 10);
      let length = 0;

      resp.on('data', chunk => {
        length += chunk.length;
        console.log(Math.round(length / total * 100) + '%');
      });

      return utils.promisifyStream(
        resp.pipe(fs.createWriteStream(this.KITE_DMG_PATH)));
    });
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
        throw new KiteError('bad_state', this.STATES.INSTALLED);
      }
    });
  },

  canRunKite() {
    return this.isKiteInstalled()
    .then(() =>
      utils.reversePromise(this.isKiteRunning(),
        new KiteError('bad_state', this.STATES.RUNNING)));
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
        throw new KiteError('bad_state', this.STATES.RUNNING);
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
        throw new KiteError('http_error', err);
      }))
    .then((resp) => {
      switch (resp.statusCode) {
        case 200:
          return utils.handleResponseData(resp)
          .then((data) => {
            if (data !== 'authenticated') {
              throw new KiteError('bad_state', this.STATES.REACHABLE);
            }
          });
        case 401:
          throw new KiteError('bad_state', this.STATES.REACHABLE);
        default:
          throw new KiteError('bad_status', resp.statusCode);
      }
    });
  },

  canAuthenticateUser() {
    return this.isKiteReachable();
  },

  authenticateUser(email, password) {
    return this.canAuthenticateUser()
    .then(() => {
      const content = querystring.stringify({email, password});
      return this.client.request({
        path: '/api/account/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(content),
        },
      }, content)
      .catch(err => { throw new KiteError('http_error', err); });
    })
    .then(resp => {
      switch (resp.statusCode) {
        case 200:
          break;
        case 401:
        case 400:
          throw new KiteError('unauthorized');
        default:
          throw new KiteError('bad_status', resp.statusCode);
      }
    });
  },

  authenticateSessionID(key) {
    return this.canAuthenticateUser()
    .then(() => {
      const content = querystring.stringify({key});
      return this.client.request({
        path: '/api/account/authenticate',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(content),
        },
      }, content)
      .catch(err => { throw new KiteError('http_error', err); });
    })
    .then(resp => {
      switch (resp.statusCode) {
        case 200:
          break;
        case 401:
        case 400:
          throw new KiteError('unauthorized');
        default:
          throw new KiteError('bad_status', resp.statusCode);
      }
    });

  },

  isPathWhitelisted(path) {
    return this.isUserAuthenticated()
    .then(() =>
      this.client.request({
        path: '/clientapi/settings/inclusions',
        method: 'GET',
      })
      .catch(err => { throw new KiteError('http_error', err); }))
    .then(resp => {
      if (resp.statusCode !== 200) {
        throw new KiteError('bad_status', resp.statusCode);
      }
      return utils.handleResponseData(resp);
    })
    .then(data => {
      console.log(data);
      const dirs = utils.parseJSON(data, []);
      if (!dirs.some(dir => path.indexOf(dir) === 0)) {
        throw new KiteError('bad_state', this.STATES.AUTHENTICATED);
      }
    });
  },

  canWhitelistPath(path) {
    return this.isUserAuthenticated()
    .then(() => utils.reversePromise(this.isPathWhitelisted(path),
      new KiteError('bad_state', this.STATES.WHITELISTED)));
  },

  whitelistPath(path) {
    return this.canWhitelistPath(path).then(() => {
      const content = querystring.stringify({inclusions: path});
      return this.client.request({
        path: '/clientapi/settings/inclusions',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(content),
        },
      }, content)
      .catch(err => { throw new KiteError('http_error', err); });
    })
    .then(resp => {
      if (resp.statusCode !== 200) {
        throw new KiteError('bad_status', resp.statusCode);
      }
    });
  },
};

module.exports = StateController;
