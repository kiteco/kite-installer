'use strict';

module.exports = class PassStep {
  constructor({name, retryStep} = {}) {
    this.name = name;
    this.retryStep = retryStep;
  }

  start(data) {
    return Promise.resolve(data);
  }
};
