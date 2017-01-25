'use strict';

const fs = require('fs');
const querystring = require('querystring');

const Client = require('./client.js');
const utils = require('./utils.js');
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
    if (!data || !data.email) {
      return Promise.reject(new Error('No email provided'));
    }
    const content = querystring.stringify(data);
    return this.client.request({
      path: '/account/resetPassword/request',
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
    const cookies = utils.parseSetCookies(resp.headers['set-cookie']);
    const data = JSON.stringify(cookies, null, 2);
    fs.writeFile(this.SESSION_FILE_PATH, data, {mode: 0o755 }, callback);
  },
};

module.exports = AccountManager;
