'use strict';

const http = require('http');
const https = require('https');

const utils = require('./utils.js');

var Client = class {
  constructor(hostname, port, base, ssl) {
    base = base || '';
    ssl = ssl || false;
    this.hostname = hostname;
    this.port = port;
    this.base = base;
    this.proto = ssl ? https : http;
    this.cookies = {};
  }

  request(opts, callback, data, timeout) {
    data = data || null;
    timeout = timeout || null;
    opts.hostname = this.hostname;
    if (this.port > 0) {
      opts.port = this.port;
    }
    opts.path = this.base + opts.path;
    opts.headers = opts.headers || {};
    this.writeCookies(opts.headers);
    var req = this.proto.request(opts, (resp) => {
      this.readCookies(resp);
      if (typeof callback === 'function') {
        callback(resp);
      }
    });
    if (timeout !== null) {
      req.setTimeout(timeout.msecs, timeout.callback);
    }
    if (data !== null) {
      req.write(data);
    }
    req.end();
    return req;
  }

  readCookies(resp) {
    var cookies = utils.parseSetCookies(resp.headers['set-cookie']);
    for (var i = 0; i < cookies.length; i++) {
      var c = cookies[i];
      this.cookies[c.Name] = c;
    }
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

module.exports = Client;
