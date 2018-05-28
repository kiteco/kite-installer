'use strict';

const fs = require('fs');
const path = require('path');

function deepMerge(a, b) {
  a = JSON.parse(JSON.stringify(a || {}));
  b = JSON.parse(JSON.stringify(b || {}));
  const c = Object.assign({}, a);

  Object.keys(b).forEach(k => {
    if (c[k] && typeof c[k] == 'object') {
      c[k] = deepMerge(c[k], b[k]);
    } else {
      c[k] = b[k];
    }
  });

  return c;
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

// Calls the passed-in function if its actually a function.
function guardCall(fn) { typeof fn === 'function' && fn(); }

// Attempts to parse a json string and returns the fallback if it can't.
function parseJSON(json, fallback) {
  try { return JSON.parse(json) || fallback; } catch (e) { return fallback; }
}

module.exports = {
  anyPromise,
  deepMerge,
  findClosestGitRepo,
  guardCall,
  parseJSON,
  retryPromise,
  reversePromise,
};
