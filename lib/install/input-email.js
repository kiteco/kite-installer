'use strict';

const BaseStep = require('./base-step');

module.exports = class InputEmail extends BaseStep {
  start(state) {
    return new Promise((resolve, reject) => {
      this.view.setState(state);

      this.view.onDidSubmit(() => {
        resolve({account: this.view.data});
      });
    });
  }
};
