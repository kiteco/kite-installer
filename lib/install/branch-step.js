'use strict';

const BaseStep = require('./base-step');

module.exports = class BranchStep extends BaseStep {
  constructor(branches, options) {
    super(options);
    this.branches = branches;
  }

  start(data) {
    return new Promise((resolve, reject) => {
      const result = this.branches.reduce((p, cond) => {
        if (p) { return p; }

        return cond.match(data) ? {step: cond.step, data} : null;
      }, null);

      result
        ? resolve(result)
        : reject();
    });
  }
};
