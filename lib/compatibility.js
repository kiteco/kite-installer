'use strict';

const fs = require('fs');
const os = require('os');
const StateController = require('./state-controller');

module.exports = {
  check: () => {
    var admin = StateController.isAdmin();
    var pluginInstalled = typeof atom.packages.getLoadedPackage('kite') !== 'undefined';
    return new Promise((resolve, reject) =>
      admin && !pluginInstalled ? resolve() : reject()
    );
  },
};
