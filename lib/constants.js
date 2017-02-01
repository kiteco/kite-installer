const os = require('os');

module.exports = {
  DEBUG: false,

  STATES: {
    UNSUPPORTED: 0,
    UNINSTALLED: 1,
    INSTALLED: 2,
    RUNNING: 3,
    REACHABLE: 4,
    AUTHENTICATED: 5,
    WHITELISTED: 6,
  },

  SUPPORTS: {
    getSupport() {
      switch (os.platform()) {
        case 'darwin': return require('./support/osx');
        case 'win32': return require('./support/windows');
        default: return require('./support/no-support');
      }
    },
  },
};
