'use strict';

var child_process = require('child_process');

var AtomHelper = {
  get apm() {
    return atom.packages.getApmPath();
  },

  isPackageInstalled: function() {
    return new Promise((resolve, reject) => {
      if (!this.apm) {
        reject();
        return;
      }
      var proc = child_process.spawn(this.apm, ['list'], {
        encoding: 'utf8',
      });
      var output = '';
      proc.stdout.on('data', (data) => {
        output += data.toString();
      });
      proc.on('close', (code) => {
        code || output.indexOf(' kite@') === -1 ? reject() : resolve();
      });
    });
  },

  installPackage: function() {
    return this.apm ?
      child_process.spawn(this.apm, ['install', 'kite']) : null;
  },

  activatePackage: function() {
    return atom ? atom.packages.activatePackage('kite') : null;
  },

  deactivatePackage: function() {
    if (!atom) {
      return false;
    }
    if (atom.packages.isPackageActive('kite')) {
      atom.packages.deactivatePackage('kite');
    }
    if (atom.packages.isPackageLoaded('kite')) {
      atom.packages.unloadPackage('kite');
    }
    return true;
  },

  enablePackage: function() {
    return atom ? atom.packages.enablePackage('kite') : null;
  },

  disablePackage: function() {
    return atom ? atom.packages.disablePackage('kite') : null;
  },

  refreshPackage: function() {
    if (!atom || !this.apm) {
      return null;
    }
    return new Promise((resolve, reject) => {
      this.deactivatePackage();
      var proc = this.installPackage();
      proc.on('close', (code) => {
        if (code) {
          reject(code);
        } else {
          this.activatePackage().then(() => {
            this.enablePackage();
          });
          resolve();
        }
      });
    });
  },
};

module.exports = AtomHelper;
