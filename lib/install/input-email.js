'use strict';

const BaseStep = require('./base-step');

module.exports = class InputEmail extends BaseStep {
  start({email} = {}, err) {
    return new Promise((resolve, reject) => {
      this.view.setError(err);
      this.view.setEmail(email);

      this.view.onDidSubmit(() => {
        resolve(this.view.data);
      });
    });
  }
};
