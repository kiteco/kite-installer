'use strict';

module.exports = class InputEmail {
  constructor(view, {name, retryStep} = {}) {
    this.name = name;
    this.retryStep = retryStep;
    this.view = view;
  }
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
