'use strict';

module.exports = function(tracker) {
  return {
    trackUncaught: () => {
      window.onerror = (msg, url, line, col, err) => {
        var data = {
          msg: msg,
          url: url,
          line: line,
          col: col,
        };
        tracker.trackEvent("uncaught error", { uncaughtError: data });
      };
    },
    ignoreUncaught: () => {
      window.onerror = () => {};
    },
  };
};
