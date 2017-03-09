'use strict';

const Logger = require('../logger');
const AccountManager = require('../account-manager');
const {Tracker} = require('../../ext/telemetry/metrics');
const {handleResponseData} = require('../utils');

module.exports = class CheckEmail {
  start(data) {
    Tracker.trackEvent('creating account');
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
          return {
            email: data.email,
            invalid: json.email_invalid,
            exists: json.account_exists,
            hasPassword: json.has_password,
            reason: json.fail_reason,
          };
      }
      return undefined;
    })
    .catch(err => {
      Tracker.trackEvent('error creating account', { error: err.message });
      Logger.error('error creating account:', err);
    });
  }
};
