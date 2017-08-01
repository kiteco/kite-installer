'use strict';

const opn = require('opn');
const AccountManager = require('../account-manager');
const {handleResponseData} = require('../utils');

const BaseStep = require('./base-step');

module.exports = class Login extends BaseStep {
  start({account: {email}} = {}, install) {
    this.install = install;
    return new Promise((resolve, reject) => {
      this.view.onDidSubmit(() => resolve(this.onSubmit()));
      this.view.onDidForgotPassword(() => {
        opn(`https://alpha.kite.com/account/resetPassword/request?email=${email}`);
      });
    });
  }

  onSubmit() {
    const data = this.view.data;
    this.install.updateState({error: null});
    return AccountManager.login(data)
    .then(resp => Promise.all([
      Promise.resolve(resp.statusCode),
      handleResponseData(resp),
    ]))
    .then(([status, raw]) => {
      switch (status) {
        case 200:
          break;
        case 500:
          throw new Error('Server error while checking email');
        default:
          throw new Error(`Unable to login: ${JSON.parse(raw).message}`);
      }
    });
  }
};
