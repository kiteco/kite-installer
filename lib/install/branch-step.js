'use strict';

module.exports = class BranchStep {
  constructor(branches, {name, retryStep} = {}) {
    this.name = name;
    this.retryStep = retryStep;
    this.branches = branches;
  }

  start(data) {
    return this.branches.reduce((p, step) => {
      if (p) { return p; }

      return step.match(data) ? step.start() : null;
    }, null) || Promise.reject();
  }
};
