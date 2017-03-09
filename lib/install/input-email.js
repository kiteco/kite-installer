'use strict';

module.exports = class InputEmail {
  constructor(view) {
    this.view = view;
  }
  start({email} = {}) {
    return new Promise((resolve, reject) => {
      this.view.setEmail(email);

      this.view.onDidSubmit(() => {
        resolve(this.view.data);
      });
    });
  }
};