'use strict';

const {parseSetCookies, findCookie} = require('kite-connector/lib/utils');
const AccountManager = require('../account-manager');
const BaseStep = require('./base-step');

module.exports = class Login extends BaseStep {
  start({account: {email}} = {}, install) {
    this.install = install;
    return new Promise((resolve, reject) => {
      this.subscriptions.add(install.on('did-submit-credentials', ({email, password}) =>
        resolve(this.onSubmit({email, password}))));

      this.subscriptions.add(install.on('did-click-back', () => {
        resolve({step: this.options.backStep, data: {error: null}});
      }));

      this.subscriptions.add(install.on('did-forgot-password', () => {
        AccountManager.resetPassword({email}).then(resp => {
          if (resp.statusCode === 200) {
            install.emit('did-reset-password', email);
          }
          return;
        });
      }));
    });
  }

  onSubmit(data) {
    this.install.updateState({error: null, account: data});
    return AccountManager.login(data)
    .then((resp) => {
      return {
        account: {
          sessionId: findCookie(parseSetCookies(resp.headers['set-cookie']), 'kite-session').Value,
        },
      };
    });
  }
};
