'use strict';

const CreateAccount = require('../../lib/install/create-account');
const CreateAccountElement = require('../../lib/elements/atom/create-account-element');

describe('CreateAccount', () => {
  let step, view, promise;

  beforeEach(() => {
    view = new CreateAccountElement();
    step = new CreateAccount(view);
  });

  describe('when started with an email', () => {
    beforeEach(() => {
      promise = step.start('some.email@company.com');
    });

    it('fills the input with the provided email', () => {
      expect(view.querySelector('input').value).toEqual('some.email@company.com');
    });

    describe('submitting the step', () => {
      it('resolves the pending promise', () => {
        view.submit.dispatchEvent(new Event('click'));

        waitsForPromise(() => promise.then(data => {
          expect(data.email).toEqual('some.email@company.com');
        }));
      });
    });
  });

  describe('when started without an email', () => {
    beforeEach(() => {
      promise = step.start();
    });

    it('leaves the input empty', () => {
      expect(view.querySelector('input').value).toEqual('');
    });

    describe('submitting the step without a valid email', () => {
      it('does not validate the form and reports an error', () => {
        const spy = jasmine.createSpy();
        view.onDidSubmit(spy);
        view.submit.dispatchEvent(new Event('click'));

        expect(spy).not.toHaveBeenCalled();
        expect(view.querySelector('input:invalid')).toExist();
      });
    });
  });
});
