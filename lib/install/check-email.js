'use strict';

const BaseStep = require('./base-step');
const AccountManager = require('../account-manager');

module.exports = class CheckEmail extends BaseStep {
  start({account}) {
    if (account.skipped) {
      return Promise.resolve({skipped: true});
    }

    return AccountManager.checkEmail(account)
    .catch(err => {
      if (err.resp) {
        return err.resp;
      } else {
        throw err;
      }
    })
    .then(() => {
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
    }).catch(err => {
      if (err.data && err.data.response) {
        const json = JSON.parse(err.data.responseData);
        switch (err.data.responseStatus) {
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
      } else {
        throw err;
      }
    });
  }
};
