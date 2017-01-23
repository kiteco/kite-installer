module.exports = {
  DEBUG: true,

  STATES: {
    UNSUPPORTED: 0,
    UNINSTALLED: 1,
    INSTALLED: 2,
    RUNNING: 3,
    REACHABLE: 4,
    AUTHENTICATED: 5,
    WHITELISTED: 6,
  },

  get NO_SUPPORT() {
    return require('./support/no-support');
  },

  get SUPPORTS() {
    return {
      darwin: require('./support/osx'),
      win32: require('./support/windows'),
    };
  },
};
