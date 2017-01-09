'use strict';

module.exports = function(tracker) {
  var prev = null;
  return {
    trackUncaught: () => {
      if (prev === null) {
        prev = window.onerror;
        window.onerror = (msg, url, line, col, err) => {
          tracker.trackEvent('uncaught error', {
            uncaughtError: { msg, url, line, col },
          });
        };
      }
    },
    ignoreUncaught: () => {
      if (prev !== null) {
        window.onerror = prev;
        prev = null;
      }
    },
  };
};
