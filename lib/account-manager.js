'use strict';

const fs = require('fs');
const querystring = require('querystring');

const Client = require('./client');
const Logger = require('./logger');
const utils = require('./utils');
const {SUPPORTS} = require('./constants');

const AccountManager = {
  client: null,

  get SESSION_FILE_PATH() {
    return this.support.sessionFilePath;
  },

  get support() {
    return SUPPORTS.getSupport();
  },

  initClient(hostname, port, ssl) {
    this.client = new Client(hostname, port, '', ssl);
  },

  disposeClient() {
    delete this.client;
  },

  createAccount(data, callback) {
    Logger.verbose('createAccount called', data);
    if (!data || !data.email) {
      return Promise.reject(new Error('No email provided'));
    }
    const content = querystring.stringify(data);
    return this.client.request({
      path: '/api/account/createPasswordless',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(content),
      },
    }, content).then(resp => {
      callback && callback(resp);
      return resp;
    });
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
    return this.client.request({
      path: '/api/account/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(content),
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
    return this.client.request({
      path: '/api/account/reset-password/request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(content),
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
