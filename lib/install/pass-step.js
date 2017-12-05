'use strict';

const BaseStep = require('./base-step');

module.exports = class PassStep extends BaseStep {
  start(data) {
    return Promise.resolve(data);
  }
};
