'use strict';

const http = require('http');
const AccountManager = require('../lib/account-manager');
const {withFakeServer, fakeResponse, fakeRequestMethod} = require('./spec-helpers');

describe('AccountManager', () => {
  beforeEach(() => AccountManager.initClient('127.0.0.1', 46624));
  afterEach(() => AccountManager.disposeClient());

  describe('.createAccount()', () => {
    describe('when the request succeeds', () => {
      withFakeServer([[
        o => /\/api\/account\/createPasswordless/.test(o.path),
        o => fakeResponse(200),
      ]], () => {
        it('returns a promise that is resolved after calling the endpoint', () => {
          waitsForPromise(() => AccountManager.createAccount({
            email: 'foo@bar.com',
          }).then(() => {
            expect(http.request).toHaveBeenCalled();
          }));
        });

        it('calls the provided callback', () => {
          const spy = jasmine.createSpy();
          waitsForPromise(() => AccountManager.createAccount({
            email: 'foo@bar.com',
          }, spy).then(() => {
            expect(spy).toHaveBeenCalled();
          }));
        });
      });
    });

    describe('when called without an email', () => {
      beforeEach(() => {
        spyOn(http, 'request').andCallFake(fakeRequestMethod(false));
      });

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => AccountManager.createAccount({}));
      });
    });

    describe('when called without any data', () => {
      beforeEach(() => {
        spyOn(http, 'request').andCallFake(fakeRequestMethod(false));
      });

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => AccountManager.createAccount());
      });
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        spyOn(http, 'request').andCallFake(fakeRequestMethod(false));
      });

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => AccountManager.createAccount({
          email: 'foo@bar.com',
        }));
      });
    });
  });
});