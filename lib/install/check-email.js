'use strict';

const {handleResponseData} = require('kite-connector/lib/utils');

const BaseStep = require('./base-step');
const AccountManager = require('../account-manager');

module.exports = class CheckEmail extends BaseStep {
  start({account}) {
    return AccountManager.checkEmail(account)
    .catch(err => {
      if (err.resp) {
        return err.resp;
      } else {
        throw err;
      }
    })
    .then(resp => Promise.all([
      Promise.resolve(resp.statusCode),
      handleResponseData(resp),
    ]))
    .then(([status, raw]) => {
      const json = status === 200 ? {} : JSON.parse(raw);
      switch (status) {
        case 200:
          return {
            error: null,
            account: {
              email: account.email,
              invalid: false,
              exists: false,
              hasPassword: false,
              reason: null,
            },
          };
        case 403:
        case 404:
        case 409:
          if (json.email_invalid) {
            const err = new Error(json.fail_reason);
            err.data = {
              account: {
                email: account.email,
                invalid: json.email_invalid,
                exists: json.account_exists,
                hasPassword: json.has_password,
                reason: json.fail_reason,
              },
            };
            throw err;
          } else {
            return {
              error: null,
              account: {
                email: account.email,
                invalid: json.email_invalid,
                exists: json.account_exists,
                hasPassword: json.has_password,
                reason: json.fail_reason,
              },
            };
          }
      }
      return undefined;
    });
  }
};
