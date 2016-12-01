var InstallFlow = require('../elements/install-flow.js');

var Installation = class {
  constructor(variant) {
    this.flow = new InstallFlow(variant);
    this.func = null;
  }
  accountCreated(func) {
    this.onAccountCreated = func;
  }
  flowSkipped(func) {
    this.onFlowSkipped = func;
  }
  destroy() {
    if (this.flow.accountCreated) {
      this.onAccountCreated();
    } else {
      this.onFlowSkipped();
    }
    this.flow.destroy();
  }
  getTitle() {
    return "Welcome to Kite";
  }
  get element() {
    return this.flow.element;
  }
};

module.exports = Installation;
