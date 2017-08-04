'use strict';

const fs = require('fs');
const os = require('os');
const StateController = require('./state-controller');

module.exports = {
  check: () => {
    var admin = StateController.isAdmin();
    var pluginInstalled = atom.packages.getLoadedPackage('kite') !== null;
    return new Promise((resolve, reject) => {
      admin && !pluginInstalled
        ? resolve()
        : reject();
    });
  },
};
