'use strict';

const fs = require('fs');

const http = require('http');
const https = require('https');

const KiteError = require('./kite-error');
const Logger = require('./logger');
const utils = require('./utils');
const {SUPPORTS} = require('./constants');

module.exports = class Client {
  constructor(hostname, port, base, ssl) {
    base = base || '';
    ssl = ssl || false;
    this.hostname = hostname;
    this.port = port;
    this.base = base;
    this.protocol = ssl ? https : http;
    this.cookies = {};
  }

  request(opts, data, timeout) {
    return new Promise((resolve, reject) => {
      data = data || null;
      timeout = timeout || null;
      opts.hostname = this.hostname;
      if (this.port > 0) { opts.port = this.port; }
      opts.path = this.base + opts.path;
      opts.headers = opts.headers || {};
      this.writeCookies(opts.headers);
      const req = this.protocol.request(opts, resp => {
        this.readCookies(resp);
        resolve(resp);
      });
      Logger.logRequest(req);
      req.on('error', err => reject(err));
      if (timeout !== null) {
        req.setTimeout(timeout, () => reject(new KiteError('timeout')));
      }
      if (data) { req.write(data); }
      req.end();
    });
  }

  readCookies(resp) {
    utils.parseSetCookies(resp.headers['set-cookie']).forEach(c => {
      this.cookies[c.Name] = c;
    });
  }

  writeCookies(hdrs) {
    var cookies = [];
    for (var k in this.cookies) {
      cookies.push(this.cookies[k]);
    }
    if (cookies.length) {
      hdrs.Cookies = utils.dumpCookies(cookies);
    }
  }
};
