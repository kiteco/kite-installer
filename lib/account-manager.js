'use strict';

const fs = require('fs');
const querystring = require('querystring');

const Client = require('./client.js');
const utils = require('./utils.js');

const AccountManager = {
  SESSION_FILE_PATH: process.env.HOME + '/.kite/session.json',

  client: null,

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
    }, content).then(callback || (() => {}));
  },

  login: function(data, callback) {
    if (!data.email) {
      throw new Error('No email provided');
    }
    if (!data.password) {
      throw new Error('No password provided');
    }
    var content = querystring.stringify(data);
    return this.client.request({
      path: '/api/account/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(content),
      },
    }, content).then(callback || (() => {}));
  },

  resetPassword: function(data, callback) {
    if (!data.email) {
      throw new Error('No email provided');
    }
    var content = querystring.stringify(data);
    return this.client.request({
      path: '/account/resetPassword/request',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(content),
      },
    }, content).then(callback || (() => {}));
  },

  saveSession: function(resp, callback) {
    var cookies = utils.parseSetCookies(resp.headers['set-cookie']);
    var data = JSON.stringify(cookies, null, 2);
    fs.writeFile(this.SESSION_FILE_PATH, data, {
      mode: 0o755,
    }, callback);
  },
};

module.exports = AccountManager;
