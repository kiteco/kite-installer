var InstallFlow = require('../elements/install-flow.js');

var Installation = class {
  constructor(variant) {
    this.flow = new InstallFlow(variant);
  }
  destroy() {
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
