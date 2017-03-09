'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const Logger = require('../logger');
var {Tracker} = require('../../ext/telemetry/metrics');

module.exports = class GetEmail {
  start() {
    return new Promise((resolve, reject) => {
      const gitconfig = String(fs.readFileSync(path.join(os.homedir(), '.gitconfig')));

      const lines = gitconfig.split('\n');
      const line = lines.filter(line => /^\s*email\s=/.test(line))[0];

      resolve({email: line ? line.split('=')[1].trim() : undefined});
    }).catch(err => {
      Tracker.trackEvent('error parsing gitconfig', { error: err.message });
      Logger.error('error parsing gitconfig:', err);
      return {email: undefined};
    });
  }
};
