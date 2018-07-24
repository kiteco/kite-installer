'use strict';

const expect = require('expect.js');
const {fakeResponse} = require('kite-connector/test/helpers/http');
const {waitsForPromise} = require('kite-connector/test/helpers/async');

const CheckEmail = require('../../lib/install/check-email');
const {withAccountServer} = require('../spec-helpers');

describe('CheckEmail', () => {
  let step;

  beforeEach(() => {
    step = new CheckEmail();
  });

  describe('called with an email', () => {
    describe('that is not linked to an account', () => {
      withAccountServer([
        [
          o => o.method === 'POST' && o.path === '/api/account/check-email',
          o => fakeResponse(200),
        ],
      ], () => {
        it('resolves with a passwordless account', () => {
          return waitsForPromise(() =>
          step.start({account: {email: 'some.email@company.com'}}).then(data => {
            expect(data.account).to.eql({
              email: 'some.email@company.com',
              invalid: false,
              exists: false,
              hasPassword: false,
              reason: null,
            });
          }));
        });
      });
    });

    describe('that has an account', () => {
      withAccountServer([
        [
          o => o.method === 'POST' && o.path === '/api/account/check-email',
          o => fakeResponse(403, JSON.stringify({
            fail_reason: 'email address already in use',
            email_invalid: false,
            account_exists: true,
            has_password: true,
          })),
        ],
      ], () => {
        it('resolves with an existing account', () => {
          return waitsForPromise(() =>
          step.start({account: {email: 'some.email@company.com'}}).then(data => {
            expect(data.account).to.eql({
              email: 'some.email@company.com',
              invalid: false,
              exists: true,
              hasPassword: true,
              reason: 'email address already in use',
            });
          }));
        });
      });
    });

    describe('that has an account but no password', () => {
      withAccountServer([
        [
          o => o.method === 'POST' && o.path === '/api/account/check-email',
          o => fakeResponse(403, JSON.stringify({
            fail_reason: 'email address already in use',
            email_invalid: false,
            account_exists: true,
            has_password: false,
          })),
        ],
      ], () => {
        it('resolves with an existing account', () => {
          return waitsForPromise(() =>
          step.start({account: {email: 'some.email@company.com'}}).then(data => {
            expect(data.account).to.eql({
              email: 'some.email@company.com',
              invalid: false,
              exists: true,
              hasPassword: false,
              reason: 'email address already in use',
            });
          }));
        });
      });
    });

    describe('that is not a valid email', () => {
      withAccountServer([
        [
          o => o.method === 'POST' && o.path === '/api/account/check-email',
          o => fakeResponse(403, JSON.stringify({
            fail_reason: 'invalid email address',
            email_invalid: true,
            account_exists: false,
            has_password: false,
          })),
        ],
      ], () => {
        it('resolves with an existing account', () => {
          return waitsForPromise({shouldReject: true}, () =>
          step.start({account: {email: 'some'}}).catch(err => {
            expect(err.data).to.eql({
              account: {
                email: 'some',
                invalid: true,
                exists: false,
                hasPassword: false,
                reason: 'invalid email address',
              },
            });

            throw err;
          }));
        });
      });
    });
  });

  describe('when a server error occurs', () => {
    withAccountServer([
      [
        o => o.method === 'POST' && o.path === '/api/account/check-email',
        o => fakeResponse(500),
      ],
    ], () => {
      it('rejects the promise', () => {
        return waitsForPromise({
          shouldReject: true,
        }, () => step.start({account: {email: 'some.email@company.com'}}));
      });
    });
  });
});
