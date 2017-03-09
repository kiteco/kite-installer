'use strict';

const CheckEmail = require('../../lib/install/check-email');
const {withFakeServer, fakeResponse, withAccountManager} = require('../spec-helpers');

describe('CheckEmail', () => {
  let step;

  withAccountManager();

  beforeEach(() => {
    step = new CheckEmail();
  });

  describe('called with an email', () => {
    describe('that is not linked to an account', () => {
      withFakeServer([
        [
          o => o.method === 'POST' && o.path === '/api/account/check-email',
          o => fakeResponse(200),
        ],
      ], () => {
        it('resolves with a passwordless account', () => {
          waitsForPromise(() =>
          step.start({email: 'some.email@company.com'}).then(data => {
            expect(data).toEqual({
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
      withFakeServer([
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
          waitsForPromise(() =>
          step.start({email: 'some.email@company.com'}).then(data => {
            expect(data).toEqual({
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
      withFakeServer([
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
          waitsForPromise(() =>
          step.start({email: 'some.email@company.com'}).then(data => {
            expect(data).toEqual({
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
  });

  describe('when a server error occurs', () => {
    withFakeServer([
      [
        o => o.method === 'POST' && o.path === '/api/account/check-email',
        o => fakeResponse(500),
      ],
    ], () => {
      it('rejects the promise', () => {
        waitsForPromise({
          shouldReject: true,
        }, () => step.start({email: 'some.email@company.com'}));
      });
    });
  });
});
