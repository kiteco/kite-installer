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
    const domain = this.port && this.port !== -1
      ? `${this.hostname}:${this.port}`
      : this.hostname;
    const url = `${this.protocol}://${domain}${this.base}${opts.path}`;
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
      if (timeout) {
        query.timeout = timeout; // Set timeout to 4 seconds (4000 milliseconds)
        query.ontimeout = () => { reject(new Error('Request Timeout')); };
      }

      if (opts.headers) {
        for (const header in opts.headers) {
          query.setRequestHeader(header, opts.headers[header]);
        }

      }
      if (!opts.headers || !opts.headers['Cache-Control']) {
        query.setRequestHeader('Cache-Control', 'no-cache, must-revalidate');
      }

      query.send(data);
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
