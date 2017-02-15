'use strict';

const fs = require('fs');
const querystring = require('querystring');
const https = require('https');

const localconfig = require('../ext/telemetry/localconfig');
const Client = require('./client.js');
const KiteError = require('./kite-error');
const utils = require('./utils');
const Logger = require('./logger');
const {STATES, SUPPORTS} = require('./constants');

const StateController = {
  client: new Client('127.0.0.1', 46624, '', false),

  STATES,

  get support() {
    return SUPPORTS.getSupport();
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

  handleState(path) {
    return this.isPathWhitelisted(path)
    .then(() => STATES.WHITELISTED)
    .catch(err => {
      if (err.type !== 'bad_state') { throw err; }
      return err.data;
    });
  },

  arch() {
    return this.support.arch();
  },

  isAdmin() {
    return this.support.isAdmin();
  },

  isOSSupported() {
    return this.support.isOSSupported();
  },

  isOSVersionSupported() {
    return this.support.isOSSupported();
  },

  isKiteSupported() {
    Logger.verbose('isKiteSupported called');
    return this.support.isKiteSupported()
      ? Promise.resolve()
      : Promise.reject({
        type: 'bad_state',
        data: STATES.UNSUPPORTED,
      });
  },

  isKiteInstalled() {
    Logger.verbose('isKiteInstalled called');
    return this.isKiteSupported()
    .then(() => this.support.isKiteInstalled());
  },

  canInstallKite() {
    Logger.verbose('canInstallKite called');
    return this.isKiteSupported()
    .then(() =>
      utils.reversePromise(this.isKiteInstalled(),
        new KiteError('bad_state', STATES.INSTALLED)));
  },

  downloadKiteRelease(opts) {
    Logger.verbose('downloadKiteRelease called', opts);
    return this.downloadKite(this.releaseURL, opts || {});
  },

  downloadKite(url, opts) {
    Logger.verbose('downloadKite called', url, opts);
    opts = opts || {};
    return this.canInstallKite()
    .then(() => this.streamKiteDownload(url, opts.onDownloadProgress))
    .then(() => utils.guardCall(opts.onDownload))
    .then(() => opts.install && this.installKite(opts));
  },

  streamKiteDownload(url, progress) {
    Logger.verbose('streamKiteDownload called', url);
    const req = https.request(url);
    Logger.logRequest(req);
    req.end();

    return utils.followRedirections(req)
    .then(resp => {
      if (progress) {
        const total = parseInt(resp.headers['content-length'], 10);
        let length = 0;

        resp.on('data', chunk => {
          length += chunk.length;
          progress(length, total, length / total);
        });
      }

      return utils.promisifyStream(
        resp.pipe(fs.createWriteStream(this.downloadPath)));
    });
  },

  installKite(opts) {
    Logger.verbose('installKite called', opts);
    return this.support.installKite(opts);
  },

  isKiteRunning() {
    Logger.verbose('isKiteRunning called');
    return this.isKiteInstalled()
    .then(() => this.support.isKiteRunning());
  },

  canRunKite() {
    Logger.verbose('canRunKite called');
    return this.isKiteInstalled()
    .then(() =>
      utils.reversePromise(this.isKiteRunning(),
        new KiteError('bad_state', STATES.RUNNING)));
  },

  runKite() {
    Logger.verbose('runKite called');
    return this.canRunKite()
    .then(() => this.support.runKite())
    .catch((err) => {
      if (err.data !== STATES.RUNNING) {
        throw err;
      }
    });
  },

  isKiteReachable() {
    Logger.verbose('isKiteReachable called');
    return this.isKiteRunning()
    .then(() =>
      this.client.request({
        path: '/system',
        method: 'GET',
      }).catch(err => {
        throw new KiteError('bad_state', STATES.RUNNING);
      }));
  },

  waitForKite(attempts, interval) {
    Logger.verbose('waitForKite called', attempts, interval);
    return utils.retryPromise(() => this.isKiteReachable(), attempts, interval);
  },

  runKiteAndWait(attempts, interval) {
    Logger.verbose('runKiteAndWait called', attempts, interval);
    return this.runKite().then(() => this.waitForKite(attempts, interval));
  },

  isUserAuthenticated() {
    Logger.verbose('isUserAuthenticated called');
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
              throw new KiteError('bad_state', STATES.REACHABLE);
            }
          });
        case 401:
          throw new KiteError('bad_state', STATES.REACHABLE);
        default:
          throw new KiteError('bad_status', resp.statusCode);
      }
    });
  },

  canAuthenticateUser() {
    Logger.verbose('canAuthenticateUser called');
    return this.isKiteReachable();
  },

  authenticateUser(email, password) {
    Logger.verbose('authenticateUser called');
    return this.canAuthenticateUser()
    .then(() => {
      const content = querystring.stringify({
        email, password,
        localtoken: this.client.LOCAL_TOKEN,
      });
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
      Logger.logResponse(resp);
      switch (resp.statusCode) {
        case 200:
          return this.saveUserID();
        case 401:
        case 400:
          throw new KiteError('unauthorized');
        default:
          throw new KiteError('bad_status', resp.statusCode);
      }
    });
  },

  authenticateSessionID(key) {
    Logger.verbose('authenticateSessionID called');
    return this.canAuthenticateUser()
    .then(() => {
      const content = querystring.stringify({
        key,
        localtoken: this.client.LOCAL_TOKEN,
      });
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
      Logger.logResponse(resp);
      switch (resp.statusCode) {
        case 200:
          return this.saveUserID();
        case 401:
        case 400:
          throw new KiteError('unauthorized');
        default:
          throw new KiteError('bad_status', resp.statusCode);
      }
    });

  },

  isPathWhitelisted(path) {
    Logger.verbose('isPathWhitelisted called', path);

    return this.isUserAuthenticated().then(() => {
      if (!path) { throw new KiteError('bad_state', STATES.AUTHENTICATED); }
      return this.pathInWhitelist(path);
    });
  },

  pathInWhitelist(path) {
    return !path
      ? Promise.reject(new KiteError('no path provided'))
      : this.client.request({
        path: '/clientapi/settings/inclusions',
        method: 'GET',
      })
      .catch(err => { throw new KiteError('http_error', err); })
      .then(resp => {
        if (resp.statusCode !== 200) {
          throw new KiteError('bad_status', resp.statusCode);
        }
        return utils.handleResponseData(resp);
      })
      .then(data => {
        const dirs = utils.parseJSON(data, []);
        if (!dirs.some(dir => path.indexOf(dir) === 0)) {
          throw new KiteError('bad_state', STATES.AUTHENTICATED);
        }
      });
  },

  canWhitelistPath(path) {
    Logger.verbose('canWhitelistPath called', path);
    return this.isUserAuthenticated()
    .then(() => utils.reversePromise(this.isPathWhitelisted(path),
      new KiteError('bad_state', STATES.WHITELISTED)));
  },

  whitelistPath(path) {
    Logger.verbose('whitelistPath called', path);
    return this.canWhitelistPath(path).then(() => {
      const content = querystring.stringify({
        inclusions: path,
        localtoken: this.client.LOCAL_TOKEN,
      });
      return this.client.request({
        path: '/clientapi/settings/inclusions',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(content),
        },
      }, content)
      .catch(err => {
        throw new KiteError('http_error', err, path);
      });
    })
    .then(resp => {
      Logger.logResponse(resp);
      if (resp.statusCode !== 200) {
        throw new KiteError('bad_status', resp.statusCode, path);
      }

      return this.saveUserID();
    });
  },

  saveUserID() {
    return this.client.request({
      path: '/clientapi/user',
      method: 'GET',
    })
    .then(resp => {
      Logger.logResponse(resp);
      if (resp.statusCode !== 200) {
        throw new Error('Unable to reach user endpoint');
      }
      return utils.handleResponseData(resp);
    })
    .then(data => {
      data = JSON.parse(data);
      if (data.id !== undefined) {
        localconfig.set('distinctID', data.id);
      }
    })
    .catch(err => {
      Logger.error('error saving user ID', err);
    });
  },
};

module.exports = StateController;
