'use strict';

const InputEmail = require('../../lib/install/input-email');
const InputEmailElement = require('../../lib/elements/atom/input-email-element');

describe('InputEmail', () => {
  let step, view, promise;

  beforeEach(() => {
    view = new InputEmailElement();
    step = new InputEmail({view});
  });

  describe('when started with an email', () => {
    beforeEach(() => {
      promise = step.start({account: { email: 'some.email@company.com' }});
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
      promise = step.start({account: { email: undefined }});
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
