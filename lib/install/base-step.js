'use strict';

const CompositeDisposable = require('./composite-disposable');

module.exports = class BaseStep {
  constructor(options = {}) {
    this.options = options;
    this.name = options.name;
    this.failureStep = options.failureStep;
    this.view = options.view;
    this.subscriptions = new CompositeDisposable();
  }

  start() { return Promise.resolve(); }

  release() { this.subscriptions.dispose(); }

  getView() { return this.view; }
};
