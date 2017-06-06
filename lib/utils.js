'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const child_process = require('child_process');
const KiteError = require('./kite-error');
const Logger = require('./logger');

function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.on('response', resp => resolve(resp));
    request.on('error', err => reject(err));
  });
}

function promisifyStream(stream) {
  return new Promise((resolve, reject) => {
    stream.on('finish', () => resolve());
    stream.on('error', err => reject(err));
  });
}

function request(url) {
  return url.indexOf('https://') === 0
    ? https.request(url)
    : http.request(url);
}

function hasHeader(header, headers) {
  return header in headers ? header : false;
}

function isRedirection(resp) {
  return resp.statusCode >= 300 &&
         resp.statusCode < 400 &&
         hasHeader('location', resp.headers);
}

// Given a request this function will follow the redirection until a
// code different that 303 is returned
function followRedirections(req) {
  return promisifyRequest(req)
  .then(resp => {
    if (resp.statusCode >= 200 && resp.statusCode < 300) {
      return resp;
    } else if (isRedirection(resp)) {
      const location = resp.headers.location;
      const req = request(location);
      req.end();
      return followRedirections(req);
    } else {
      throw new KiteError('bad_status', resp.statusCode);
    }
  });
}

function bindEnterToClick(ele, btn) {
  ele.addEventListener('keypress', (e) => {
    if (e.keyCode === 13) {
      btn.click();
    }
  });
}

function parseSetCookies(cookies) {
  if (!Array.isArray(cookies) || !cookies.length) {
    return [];
  }
  var parse = (cookie) => {
    var parsed = {
      Path: '',
      Domain: '',
      Expires: new Date('0001-01-01T00:00:00Z'),
      RawExpires: '',
      MaxAge: 0,
      Secure: false,
      HttpOnly: false,
      Raw: '',
      Unparsed: null,
    };
    cookie.split('; ').forEach((raw) => {
      if (raw === 'HttpOnly') {
        parsed.HttpOnly = true;
        return;
      }
      if (raw === 'Secure') {
        parsed.Secure = true;
        return;
      }
      var idx = raw.indexOf('=');
      var key = raw.substring(0, idx);
      var val = raw.substring(idx + 1);
      if (key === 'Expires') {
        val = new Date(val);
      }
      if (key in parsed) {
        parsed[key] = val;
      } else {
        parsed.Name = key;
        parsed.Value = val;
      }
    });
    return parsed;
  };
  return cookies.map(parse);
}

function dumpCookies(cookies) {
  return cookies.map((c) => c.Name + '=' + c.Value).join('; ');
}

function handleResponseData(resp, callback) {
  Logger.logResponse(resp);
  if (callback) {
    let data = '';
    resp.on('data', (chunk) => data += chunk);
    resp.on('end', () => callback(data));
    return null;
  } else {
    return new Promise((resolve, reject) => {
      let data = '';
      resp.on('data', (chunk) => data += chunk);
      resp.on('error', err => reject(err));
      resp.on('end', () => resolve(data));
    });
  }
}

// Finds the closest Git repo by searching up the file paths.
// This function throws an error if the filePath given does not
// exist. If no Git repo exists from the filePath, this function
// returns null.
function findClosestGitRepo(filePath) {
  var isDir = (p) => {
    return fs.lstatSync(p).isDirectory();
  };
  var isRepo = (p) => {
    var n = path.join(p, '.git');
    try {
      fs.accessSync(n, fs.W_OK + fs.R_OK);
      return true;
    } catch (e) {
      return false;
    }
  };
  if (!isDir(filePath)) {
    filePath = path.dirname(filePath);
  }
  if (isRepo(filePath)) {
    return filePath;
  }
  if (filePath.length === 1) {
    return null;
  }
  return findClosestGitRepo(path.dirname(filePath));
}

// Returns a new Promise that resolve if the passed-in promise is rejected and
// will be rejected with the provided error if the passed-in promise resolve.
function reversePromise(promise, rejectionMessage, resolutionMessage) {
  return new Promise((resolve, reject) => {
    promise
    .then(() => reject(rejectionMessage))
    .catch(() => resolve(resolutionMessage));
  });
}

// Given a function returning a promise, it returns a new Promise that will be
// resolved if one of the promises returned by the function resolves. If no
// promises have been resolved after the specified amount of attempts the
// returned promise will be rejected
function retryPromise(doAttempt, attempts, interval) {
  return new Promise((resolve, reject) => {
    makeAttempt(0, resolve, reject);
  });

  function makeAttempt(n, resolve, reject) {
    var retryOrReject = (err) => {
      n + 1 >= attempts
        ? reject(err)
        : makeAttempt(n + 1, resolve, reject);
    };
    setTimeout(() =>
      doAttempt().then(resolve, retryOrReject),
      n ? interval : 0);
  }
}

// Spawns a child process and returns a promise that will be resolved if
// the process ends with a code of 0, otherwise the promise will be rejected
// with an error object of the provided rejectionType.
function spawnPromise(cmd, cmdArgs, cmdOptions, rejectionType) {
  const args = [cmd];

  if (cmdArgs) {
    typeof cmdArgs === 'string'
      ? rejectionType = cmdArgs
      : args.push(cmdArgs);
  }

  if (cmdOptions) {
    typeof cmdOptions === 'string'
      ? rejectionType = cmdOptions
      : args.push(cmdOptions);
  }

  return new Promise((resolve, reject) => {
    const proc = child_process.spawn(...args);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', data => stdout +=  data);
    proc.stderr.on('data', data => stdout +=  data);

    proc.on('close', code => {
      code
        ? reject({ type: rejectionType, data: stderr })
        : resolve(stdout);
    });
  });
}

function anyPromise(arrayOfPromises) {
  // For each promise that resolves or rejects,
  // make them all resolve.
  // Record which ones did resolve or reject
  const resolvingPromises = arrayOfPromises.map(promise => {
    return promise
    .then(result => ({resolve: true, result: result}))
    .catch(error => ({resolve: false, result: error}));
  });

  return Promise.all(resolvingPromises).then(results => {
    const resolved = results.reduce((m, r) => {
      if (m) { return m; }
      if (r.resolve) { return r; }
      return null;
    }, null);


    if (resolved) {
      return resolved.result;
    } else {
      throw results.map(r => r.result);
    }
  });
}

// Exec a child process and returns a promise that will be resolved if
// the process ends with success, otherwise the promise will be rejected
// with an error object of the provided rejectionType.
function execPromise(cmd, cmdOptions, rejectionType) {
  const args = [cmd];

  if (cmdOptions) {
    if (cmdOptions === 'string') {
      rejectionType = cmdOptions;
      cmdOptions = {};
    }
  } else {
    cmdOptions = {};
  }

  args.push(cmdOptions);

  return new Promise((resolve, reject) => {
    child_process.exec(...args, (err, stdout, stderr) => {
      if (err) { reject({ type: rejectionType, data: stderr }); }
      resolve(stdout);
    });
  });
}

// Calls the passed-in function if its actually a function.
function guardCall(fn) { typeof fn === 'function' && fn(); }

// Attempts to parse a json string and returns the fallback if it can't.
function parseJSON(json, fallback) {
  try { return JSON.parse(json) || fallback; } catch (e) { return fallback; }
}

module.exports = {
  anyPromise,
  bindEnterToClick,
  dumpCookies,
  execPromise,
  findClosestGitRepo,
  followRedirections,
  guardCall,
  handleResponseData,
  parseJSON,
  parseSetCookies,
  promisifyRequest,
  promisifyStream,
  retryPromise,
  reversePromise,
  spawnPromise,
};
