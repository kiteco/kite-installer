'use strict';

const child_process = require('child_process');
const Login = require('../../lib/install/login');
const LoginElement = require('../../lib/elements/atom/login-element');
const {withFakeServer, fakeResponse, withAccountManager, withRoutes} = require('../spec-helpers');

describe('Login', () => {
  let step, view, promise;

  withAccountManager();

  beforeEach(() => {
    view = new LoginElement();
    step = new Login(view);
  });

  withFakeServer([[
    o => o.method === 'POST' && o.path === '/api/account/login',
    o => fakeResponse(200),
  ]], () => {
    describe('when started with an account with email and password', () => {
      beforeEach(() => {
        promise = step.start({
          email: 'some.email@company.com',
          invalid: false,
          exists: true,
          hasPassword: true,
          reason: 'email address already in use',
        });
      });

      it('fills the input with the provided email', () => {
        expect(view.querySelector('input[type="email"]').value)
        .toEqual('some.email@company.com');
      });

      describe('filling the password field and submitting the step', () => {
        it('resolves the pending promise', () => {
          view.querySelector('input[type="password"]').value = 'password';
          view.form.dispatchEvent(new Event('submit'));

          waitsForPromise(() => promise);
        });
      });

      describe('clicking on the forgot password button', () => {
        it('opens the reset password form in a browser', () => {
          spyOn(child_process, 'spawn').andReturn({once: () => {}});

          view.forgotPassword.dispatchEvent(new Event('click'));

          expect(child_process.spawn).toHaveBeenCalledWith('open', [
            '-W',
            'https://alpha.kite.com/account/resetPassword/request?email=some.email@company.com',
          ], {});
        });
      });

      describe('when the login request fail', () => {
        withRoutes([[
          o => o.method === 'POST' && o.path === '/api/account/login',
          o => fakeResponse(401),
        ]]);

        it('rejects the pending promise', () => {
          view.querySelector('input[type="password"]').value = 'password';
          view.form.dispatchEvent(new Event('submit'));

          waitsForPromise({shouldReject: true}, () => promise);
        });
      });
    });
  });
});
