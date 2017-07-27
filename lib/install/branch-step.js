'use strict';

module.exports = class BranchStep {
  constructor(branches, {name, retryStep} = {}) {
    this.name = name;
    this.retryStep = retryStep;
    this.branches = branches;
  }

  start(data) {
    return new Promise((resolve, reject) => {
      const result = this.branches.reduce((p, step) => {
        if (p) { return p; }

        return step.match(data) ? {step, data} : null;
      }, null);

      result
        ? resolve(result)
        : reject();
    });
  }
};
