'use strict';

const {spawnPromise} = require('./utils');

var AtomHelper = {
  get apm() {
    return atom.packages.getApmPath();
  },

  isPackageInstalled: function() {
    return atom.packages.getAvailablePackageNames().includes('kite')
      ? Promise.resolve()
      : Promise.reject();
  },

  installPackage: function() {
    return this.apm && atom && !atom.packages.getAvailablePackageNames().includes('kite')
      ? spawnPromise(this.apm, ['install', 'kite'])
      : null;
  },

  activatePackage: function() {
    return atom && !atom.packages.getActivePackage('kite')
      ? atom.packages.activatePackage('kite')
      : null;
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
