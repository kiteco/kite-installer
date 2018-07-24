'use strict';

const expect = require('expect.js');
const {waitsForPromise} = require('kite-connector/test/helpers/async');
const InputEmail = require('../../lib/install/input-email');
const {startStep} = require('../spec-helpers');

describe('InputEmail', () => {
  let step, promise, install;

  beforeEach(() => {
    step = new InputEmail({});
  });

  describe('when started with an email', () => {
    beforeEach(() => {
      promise = startStep(step, {account: { email: 'some.email@company.com' }});
      install = promise.install;
    });

    describe('submitting the step', () => {
      it('resolves the pending promise', () => {
        install.emit('did-submit-email', {email: 'some.email@company.com'});

        return waitsForPromise(() => promise.then(data => {
          expect(data.account.email).to.eql('some.email@company.com');
        }));
      });
    });
  });
});
