'use strict';

var defaultOnError = defaultOnError || window.onerror;

module.exports = function(tracker) {
  return {
    trackUncaught: () => {
      window.onerror = (msg, url, line, col, err) => {
        tracker.trackEvent("uncaught error", {
          uncaughtError: { msg, url, line, col }
        });
      };
    },
    ignoreUncaught: () => {
      window.onerror = defaultOnError;
    },
  };
};
