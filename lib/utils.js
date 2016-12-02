'use strict';

var fs = require('fs');
var path = require('path');

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
  var data = '';
  resp.on('data', (chunk) => data += chunk);
  resp.on('end', () => {
    callback(data);
  });
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
      fs.accessSync(n, fs.W_OK | fs.R_OK);
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

module.exports = {
  bindEnterToClick: bindEnterToClick,
  parseSetCookies: parseSetCookies,
  dumpCookies: dumpCookies,
  handleResponseData: handleResponseData,
  findClosestGitRepo: findClosestGitRepo,
};
