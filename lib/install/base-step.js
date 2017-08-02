'use strict';

const CompositeDisposable = require('./composite-disposable');

module.exports = class BaseStep {
  constructor(options = {}) {
    this.name = options.name;
    this.retryStep = options.retryStep;
    this.view = options.view;
    this.subscriptions = new CompositeDisposable();
  }

  start() { return Promise.resolve(); }

  release() { this.subscriptions.dispose(); }
};
