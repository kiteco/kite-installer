'use strict';

const BaseStep = require('./base-step');
const AccountManager = require('../account-manager');
const {handleResponseData} = require('../utils');

module.exports = class CheckEmail extends BaseStep {
  start(data) {
    return AccountManager.checkEmail(data)
    .then(resp => Promise.all([
      Promise.resolve(resp.statusCode),
      handleResponseData(resp),
    ]))
    .then(([status, raw]) => {
      const json = status === 200 ? {} : JSON.parse(raw);
      switch (status) {
        case 200:
          return {
            email: data.email,
            invalid: false,
            exists: false,
            hasPassword: false,
            reason: null,
          };
        case 403:
        case 404:
        case 409:
          if (json.email_invalid) {
            const err = new Error(json.fail_reason);
            err.data = {
              email: data.email,
              invalid: json.email_invalid,
              exists: json.account_exists,
              hasPassword: json.has_password,
              reason: json.fail_reason,
            };
            throw err;
          } else {
            return {
              email: data.email,
              invalid: json.email_invalid,
              exists: json.account_exists,
              hasPassword: json.has_password,
              reason: json.fail_reason,
            };
          }
        case 500: {
          const reason = 'Server error while checking email';
          const err = new Error(reason);
          err.data = {
            email: data.email,
            invalid: null,
            exists: null,
            hasPassword: null,
            reason,
          };
          throw err;
        }
      }
      return undefined;
    });
  }
};
