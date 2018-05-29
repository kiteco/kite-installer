'use strict';

const fs = require('fs');
const querystring = require('querystring');
const KiteConnector = require('kite-connect');
const Client = require('kite-connect/lib/clients/node');
const Logger = require('kite-connect/lib/logger');

const utils = require('kite-connect/lib/utils');

const AccountManager = {
  client: null,

  get SESSION_FILE_PATH() {
    return KiteConnector.adapter.sessionFilePath;
  },

  initClient(hostname, port, ssl) {
    this.client = new Client(hostname, port, '', ssl);
  },

  disposeClient() {
    delete this.client;
  },

  request(opts, data) {
    return this.client.request(opts, data).then(resp => {
      if (resp.statusCode < 500) {
        return resp;
      } else {
        throw new Error('bad_status');
      }
    });
  },

  checkEmail(data) {
    Logger.verbose('checkEmail called', data);
    if (!data || !data.email) {
      return Promise.reject(new Error('No email provided'));
    }
    return this.request({
      path: '/api/account/check-email',
      method: 'POST',
    }, JSON.stringify(data));
  },

  createAccount(data, callback) {
    Logger.verbose('createAccount called', data);
    if (!data || !data.email) {
      return Promise.reject(new Error('No email provided'));
    }

    const content = querystring.stringify(data);
    if (data.password) {
      return this.request({
        path: '/api/account/create',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }, content).then(resp => {

        callback && callback(resp);
        return resp;
      });
    } else {
      return this.request({
        path: '/api/account/createPasswordless',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }, content).then(resp => {
        callback && callback(resp);
        return resp;
      });
    }
  },

  login(data, callback) {
    Logger.verbose('login called', data);
    if (!data) {
      return Promise.reject(new Error('No login data provided'));
    }
    if (!data.email) {
      return Promise.reject(new Error('No email provided'));
    }
    if (!data.password) {
      return Promise.reject(new Error('No password provided'));
    }
    const content = querystring.stringify(data);
    return this.request({
      path: '/api/account/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }, content)
    .then(resp => {
      callback && callback(resp);
      return resp;
    });
  },

  resetPassword(data, callback) {
    Logger.verbose('resetPassword called', data);
    if (!data || !data.email) {
      return Promise.reject(new Error('No email provided'));
    }
    const content = querystring.stringify(data);
    return this.request({
      path: '/api/account/reset-password/request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }, content).then(resp => {
      callback && callback(resp);
      return resp;
    });
  },

  saveSession(resp, callback) {
    Logger.verbose('saveSession called', resp);
    const cookies = utils.parseSetCookies(resp.headers['set-cookie']);
    const data = JSON.stringify(cookies, null, 2);
    fs.writeFile(this.SESSION_FILE_PATH, data, {mode: 0o755 }, callback);
  },
};

module.exports = AccountManager;
