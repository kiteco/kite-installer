'use strict';

module.exports = function(tracker) {
  return {
    trackUncaught: () => {
      window.onerror = (msg, url, line, col, err) => {
        tracker.trackEvent("uncaught error", {
          uncaughtError: {
            msg: msg,
            url: url,
            line: line,
            col: col,
          }
        });
      };
    },
    ignoreUncaught: () => {
      window.onerror = () => {};
    },
  };
};
