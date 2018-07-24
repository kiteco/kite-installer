'use strict';

const expect = require('expect.js');
const sinon = require('sinon');
const {waitsForPromise} = require('kite-connector/test/helpers/async');
const {fakeResponse} = require('kite-connector/test/helpers/http');
const AccountManager = require('../../lib/account-manager');
const Login = require('../../lib/install/login');
const {withAccountServer, withAccountRoutes, startStep} = require('../spec-helpers');

describe('Login', () => {
  let step, view, promise, install;

  beforeEach(() => {
    step = new Login();
  });

  withAccountServer([
    [
      o => o.method === 'POST' && o.path === '/api/account/login',
      o => fakeResponse(200, '', {
        headers: {
          'set-cookie': ['kite-session=foobar'],
        },
      }),
    ], [
      o => o.path === '/api/account/reset-password/request',
      o => fakeResponse(200),
    ],
  ], () => {
    describe('when started with an account with email and password', () => {
      beforeEach(() => {
        promise = startStep(step, {
          account: {
            email: 'some.email@company.com',
            invalid: false,
            exists: true,
            hasPassword: true,
            reason: 'email address already in use',
          },
        });
        install = promise.install;
      });

      describe('filling the password field and submitting the step', () => {
        it('resolves the pending promise', () => {
          install.emit('did-submit-credentials', {
            email: 'some.email@company.com',
            password: 'password',
          });

          return waitsForPromise(() => promise.then(state => {
            expect(state.account.sessionId).to.eql('foobar');
          }));
        });
      });

      describe('clicking on the forgot password button', () => {
        it('opens the reset password form in a browser', () => {
          const spy = sinon.spy(AccountManager, 'resetPassword');
          install.emit('did-forgot-password');

          expect(AccountManager.resetPassword.calledWith({
            email: 'some.email@company.com',
          })).to.be.ok();

          spy.restore();
        });
      });

      describe('when the login request fail', () => {
        withAccountRoutes([[
          o => o.method === 'POST' && o.path === '/api/account/login',
          o => fakeResponse(401),
        ]]);

        it('rejects the pending promise', () => {
          install.emit('did-submit-credentials', {
            email: 'some.email@company.com',
            password: 'password',
          });

          return waitsForPromise({shouldReject: true}, () => promise);
        });
      });
    });
  });
});
