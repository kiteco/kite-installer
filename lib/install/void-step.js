'use strict';

const BaseStep = require('./base-step');

module.exports = class VoidStep extends BaseStep {
  start() { return new Promise(() => {}); }
};
