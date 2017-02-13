'use strict';

var InstallFlow = require('../elements/install-flow.js');

var Installation = class {
  constructor(variant, title) {
    this.flow = new InstallFlow(variant);
    this.func = null;
    this.onAccountCreated = null;
    this.onFlowSkipped = null;
    this.title = title || 'Welcome to Kite';
  }
  accountCreated(func) {
    this.onAccountCreated = func;
  }
  flowSkipped(func) {
    this.onFlowSkipped = func;
  }
  destroy() {
    if (this.flow.accountCreated) {
      if (typeof (this.onAccountCreated) === 'function') {
        this.onAccountCreated();
      }
    } else {
      if (typeof this.onFlowSkipped === 'function') {
        this.onFlowSkipped();
      }
    }
    this.flow.destroy();
  }
  getTitle() {
    return this.title;
  }
  get element() {
    return this.flow.element;
  }
};

module.exports = Installation;
