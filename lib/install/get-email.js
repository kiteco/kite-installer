'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const Logger = require('kite-connector/lib/logger');
const {Tracker} = require('../../ext/telemetry/metrics');
const BaseStep = require('./base-step');

module.exports = class GetEmail extends BaseStep {
  start() {
    return new Promise((resolve, reject) => {
      const gitconfig = String(fs.readFileSync(path.join(os.homedir(), '.gitconfig')));

      const lines = gitconfig.split('\n');
      const line = lines.filter(line => /^\s*email\s=/.test(line))[0];

      resolve({account: {email: line ? line.split('=')[1].trim() : undefined}});
    }).catch(err => {
      Tracker.trackEvent('error parsing gitconfig', { error: err.message });
      Logger.error('error parsing gitconfig:', err);
      return {account: {email: undefined}};
    });
  }
};
