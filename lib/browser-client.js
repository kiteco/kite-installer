'use strict';

const KiteError = require('./kite-error');
const Logger = require('./logger');
const utils = require('./utils');

const createResponse = (status, raw, req, headers = {}) => {
  const resp = {
    statusCode: status,
    req,
    on(event, callback) {
      switch (event) {
        case 'data':
          callback(raw);
          break;
        case 'end':
          callback();
          break;
      }
    },
  };
  for (let k in headers) { resp[k] = headers[k]; }
  resp.headers = resp.headers || {
    'content-length': raw.length,
  };

  return resp;
};

module.exports = class BrowserClient {
  constructor(hostname, port, base, ssl) {
    base = base || '';
    ssl = ssl || false;
    this.hostname = hostname;
    this.port = port;
    this.base = base;
    this.protocol = ssl ? 'https' : 'http';
    this.cookies = {};
  }

  request(opts, data, timeout) {
    const url = `${this.protocol}://${this.hostname}:${this.port}${this.base}${opts.path}`;
    const method = opts.method || 'GET';

    return new Promise((resolve, reject) => {
      const query = new XMLHttpRequest();
      query.addEventListener('error', reject);
      query.addEventListener('abort', reject);
      query.addEventListener('load', () => {
        const raw = query.responseText;

        resolve(createResponse(query.status, raw, {
          method,
          path: opts.path,
          url,
        }));
      });

      query.open(method, url);

      if (opts.headers) {
        for (const header in opts) {
          query.setRequestHeader(header, opts.headers[header]);
        }
      }

      query.send(data);

      // data = data || null;
      // timeout = timeout || null;
      // opts.hostname = this.hostname;
      // if (this.port > 0) { opts.port = this.port; }
      // opts.path = this.base + opts.path;
      // opts.headers = opts.headers || {};
      // this.writeCookies(opts.headers);
      // const req = this.protocol.request(opts, resp => {
      //   this.readCookies(resp);
      //   resolve(resp);
      // });
      // Logger.logRequest(req);
      // req.on('error', err => reject(err));
      // if (timeout !== null) {
      //   req.setTimeout(timeout, () => reject(new KiteError('timeout')));
      // }
      // if (data) { req.write(data); }
      // req.end();
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
