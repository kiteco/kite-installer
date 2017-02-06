'use strict';

const fs = require('fs');
const querystring = require('querystring');
const https = require('https');

const Client = require('./client.js');
const KiteError = require('./kite-error');
const utils = require('./utils.js');
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

  isKiteSupported() {
    return this.support.isKiteSupported()
      ? Promise.resolve()
      : Promise.reject({
        type: 'bad_state',
        data: STATES.UNSUPPORTED,
      });
  },

  isKiteInstalled() {
    return this.isKiteSupported()
    .then(() => this.support.isKiteInstalled());
  },

  canInstallKite() {
    return this.isKiteSupported()
    .then(() =>
      utils.reversePromise(this.isKiteInstalled(),
        new KiteError('bad_state', STATES.INSTALLED)));
  },

  downloadKiteRelease(opts) {
    return this.downloadKite(this.releaseURL, opts || {});
  },

  downloadKite(url, opts) {
    opts = opts || {};
    return this.canInstallKite()
    .then(() => this.streamKiteDownload(opts.onDownloadProgress))
    .then(() => utils.guardCall(opts.onDownload))
    .then(() => opts.install && this.installKite(opts));
  },

  streamKiteDownload(progress) {
    const req = https.request(this.releaseURL);
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
    return this.support.installKite(opts);
  },

  isKiteRunning() {
    return this.isKiteInstalled()
    .then(() => this.support.isKiteRunning());
  },

  canRunKite() {
    return this.isKiteInstalled()
    .then(() =>
      utils.reversePromise(this.isKiteRunning(),
        new KiteError('bad_state', STATES.RUNNING)));
  },

  runKite() {
    return this.canRunKite()
    .then(() => this.support.runKite())
    .catch((err) => {
      if (err.data !== STATES.RUNNING) {
        throw err;
      }
    });
  },

  isKiteReachable() {
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
    return this.isKiteReachable();
  },

  authenticateUser(email, password) {
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
    return !path
      ? this.isUserAuthenticated().then(() => {
        throw new KiteError('bad_state', STATES.AUTHENTICATED);
      })
      : this.isUserAuthenticated().then(() =>
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
        const dirs = utils.parseJSON(data, []);
        if (!dirs.some(dir => path.indexOf(dir) === 0)) {
          throw new KiteError('bad_state', STATES.AUTHENTICATED);
        }
      });
  },

  canWhitelistPath(path) {
    return this.isUserAuthenticated()
    .then(() => utils.reversePromise(this.isPathWhitelisted(path),
      new KiteError('bad_state', STATES.WHITELISTED)));
  },

  whitelistPath(path) {
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
      if (resp.statusCode !== 200) {
        throw new KiteError('bad_status', resp.statusCode, path);
      }
    });
  },
};

module.exports = StateController;
