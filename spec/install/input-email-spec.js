'use strict';

const InputEmail = require('../../lib/install/input-email');
const InputEmailElement = require('../../lib/elements/atom/input-email-element');
const {startStep} = require('../spec-helpers');

describe('InputEmail', () => {
  let step, view, promise;

  beforeEach(() => {
    view = new InputEmailElement();
    step = new InputEmail({view});
  });

  describe('when started with an email', () => {
    beforeEach(() => {
      promise = startStep(step, {account: { email: 'some.email@company.com' }});
    });

    it('fills the input with the provided email', () => {
      expect(view.querySelector('input').value).toEqual('some.email@company.com');
    });

    describe('submitting the step', () => {
      it('resolves the pending promise', () => {
        view.form.dispatchEvent(new Event('submit'));

        waitsForPromise(() => promise.then(data => {
          expect(data.account.email).toEqual('some.email@company.com');
        }));
      });
    });
  });

  describe('when started without an email', () => {
    beforeEach(() => {
      promise = startStep(step, {account: { email: undefined }});
    });

    it('leaves the input empty', () => {
      expect(view.querySelector('input').value).toEqual('');
    });
  });
});
