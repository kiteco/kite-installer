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

  describe('.login()', () => {
    describe('when the request succeeds', () => {
      withFakeServer([[
        o => /\/api\/account\/login/.test(o.path),
        o => fakeResponse(200),
      ]], () => {
        it('returns a promise that is resolved after calling the endpoint', () => {
          waitsForPromise(() => AccountManager.login({
            email: 'foo@bar.com',
            password: 'foo',
          }).then(() => {
            expect(http.request).toHaveBeenCalled();
          }));
        });

        it('calls the provided callback', () => {
          const spy = jasmine.createSpy();
          waitsForPromise(() => AccountManager.login({
            email: 'foo@bar.com',
            password: 'foo',
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
        waitsForPromise({shouldReject: true}, () =>
          AccountManager.login({
            password: 'foo',
          }));
      });
    });

    describe('when called without a password', () => {
      beforeEach(() => {
        spyOn(http, 'request').andCallFake(fakeRequestMethod(false));
      });

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () =>
          AccountManager.login({
            email: 'foo@bar.com',
          }));
      });
    });

    describe('when called without any data', () => {
      beforeEach(() => {
        spyOn(http, 'request').andCallFake(fakeRequestMethod(false));
      });

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => AccountManager.login());
      });
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        spyOn(http, 'request').andCallFake(fakeRequestMethod(false));
      });

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => AccountManager.login({
          email: 'foo@bar.com',
        }));
      });
    });
  });

  describe('.resetPassword()', () => {
    describe('when the request succeeds', () => {
      withFakeServer([[
        o => /\/account\/resetPassword\/request/.test(o.path),
        o => fakeResponse(200),
      ]], () => {
        it('returns a promise that is resolved after calling the endpoint', () => {
          waitsForPromise(() => AccountManager.resetPassword({
            email: 'foo@bar.com',
          }).then(() => {
            expect(http.request).toHaveBeenCalled();
          }));
        });

        it('calls the provided callback', () => {
          const spy = jasmine.createSpy();
          waitsForPromise(() => AccountManager.resetPassword({
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
        waitsForPromise({shouldReject: true}, () => AccountManager.resetPassword({}));
      });
    });

    describe('when called without any data', () => {
      beforeEach(() => {
        spyOn(http, 'request').andCallFake(fakeRequestMethod(false));
      });

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => AccountManager.resetPassword());
      });
    });

    describe('when the request fails', () => {
      beforeEach(() => {
        spyOn(http, 'request').andCallFake(fakeRequestMethod(false));
      });

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => AccountManager.resetPassword({
          email: 'foo@bar.com',
        }));
      });
    });
  });
});
