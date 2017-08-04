'use strict';

const fs = require('fs');
const os = require('os');
const StateController = require('./state-controller');

module.exports = {
  check: () => {
    var platform = os.platform();
    var release = os.release();
    var arch = StateController.arch();
    var admin = StateController.isAdmin();
    var kiteInstalled = fs.existsSync(StateController.installPath);
    var atomPluginInstalled = atom.packages.getLoadedPackage('kite') !== null;

    return new Promise((resolve, reject) => {
      if (admin && !kiteInstalled && !atomPluginInstalled) {
        if (platform === 'darwin' && typeof release === 'string') {
          // Check that OS release is at least 14.0.0 (Yosemite)
          var releaseParts = release.split('.');
          if (parseInt(releaseParts[0]) >= 14) {
            resolve();
            return;
          }
        }

        if (platform === 'win32' && typeof release === 'string') {
          // Check that OS release is at least 6.1.0 (Windows 7) and architecture
          // is 64-bit
          var releaseParts = release.split('.');
          var major = parseInt(releaseParts[0]);
          var minor = parseInt(releaseParts[1]);
          if ((major >= 7 || (major === 6 && minor >= 1)) && arch !== '32bit') {
            resolve();
            return;
          }
        }
      }

      reject();
    });
  },
};
