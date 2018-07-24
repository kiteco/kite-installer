'use strict';

const expect = require('expect.js');

const {waitsForPromise} = require('kite-connector/test/helpers/async');
const WhitelistChoice = require('../../lib/install/whitelist-choice');
const {startStep} = require('../spec-helpers');

describe('WhitelistChoice', () => {
  let step, promise, install;

  beforeEach(() => {
    step = new WhitelistChoice();
    promise = startStep(step, {
      path: '/path/to/dir',
    });
    install = promise.install;
  });

  describe('when the did-whitelist event is emitted', () => {
    it('resolves the step promise and update the state', () => {
      install.emit('did-whitelist');
      return waitsForPromise(() => promise).then(() => {
        expect(install.state).to.eql({
          path: '/path/to/dir',
          whitelist: '/path/to/dir',
        });
      });
    });
  });

  describe('when the did-skip-whitelist event is emitted', () => {
    it('resolves the step promise and update the state', () => {
      install.emit('did-skip-whitelist');
      return waitsForPromise(() => promise).then(() => {
        expect(install.state).to.eql({
          path: '/path/to/dir',
          whitelist: 'skipped',
        });
      });
    });
  });
});
