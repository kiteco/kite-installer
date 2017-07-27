'use strict';

const BaseStep = require('./base-step');
const AccountManager = require('../account-manager');

module.exports = class CreateAccount extends BaseStep {
  start({account: {email}} = {}, err) {
    return AccountManager.createAccount({email});
  }
};
