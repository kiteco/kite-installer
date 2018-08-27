'use strict';

const BaseStep = require('./base-step');
const AccountManager = require('../account-manager');
const utils = require('kite-connector/lib/utils');

module.exports = class CreateAccount extends BaseStep {
  start({account: {email}}, err) {
    return AccountManager.createAccount({email}).then(resp => {
      const cookies = utils.parseSetCookies(resp.headers['set-cookie']);
      return {
        account: {
          sessionId: utils.findCookie(cookies, 'kite-session').Value,
        },
      };
    });
  }
};
