'use strict';

const BaseStep = require('./base-step');
const StateController = require('../state-controller');

module.exports = class Download extends BaseStep {
  start() {
    return StateController.downloadKiteRelease();
  }
};
