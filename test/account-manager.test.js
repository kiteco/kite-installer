'use strict';

const expect = require('expect.js');
const sinon = require('sinon');
const AccountManager = require('../lib/account-manager');
const {waitsForPromise} = require('kite-connector/test/helpers/async');
const {fakeResponse} = require('kite-connector/test/helpers/http');
const {withAccountServer} = require('./spec-helpers');

describe('AccountManager', () => {
  describe('.createAccount()', () => {
    describe('when the request succeeds', () => {
      withAccountServer([[
        o => /\/api\/account\/createPasswordless/.test(o.path),
        o => fakeResponse(200),
      ]], () => {
        it('returns a promise that is resolved after calling the endpoint', () => {
          return waitsForPromise(() => AccountManager.createAccount({
            email: 'foo@bar.com',
          }).then(() => {
            expect(AccountManager.client.request.called).to.be.ok();
          }));
        });

        it('calls the provided callback', () => {
          const spy = sinon.spy();
          return waitsForPromise(() => AccountManager.createAccount({
            email: 'foo@bar.com',
          }, spy).then(() => {
            expect(spy.called).to.be.ok();
          }));
        });
      });
    });

    describe('when called with a password', () => {
      withAccountServer([[
        o => /\/api\/account\/create$/.test(o.path),
        o => fakeResponse(200),
      ]], () => {
        it('returns a promise that is resolved after calling the endpoint', () => {
          return waitsForPromise(() => AccountManager.createAccount({
            email: 'foo@bar.com',
            password: 'foobarbaz',
          }).then(() => {
            expect(AccountManager.client.request.called).to.be.ok();
          }));
        });

        it('calls the provided callback', () => {
          const spy = sinon.spy();
          return waitsForPromise(() => AccountManager.createAccount({
            email: 'foo@bar.com',
            password: 'foobarbaz',
          }, spy).then(() => {
            expect(spy.called).to.be.ok();
          }));
        });
      });
    });

    describe('when called without an email', () => {
      withAccountServer();

      it('returns a rejected promise', () => {
        return waitsForPromise({shouldReject: true}, () => AccountManager.createAccount({}));
      });
    });

    describe('when called without any data', () => {
      withAccountServer();

      it('returns a rejected promise', () => {
        return waitsForPromise({shouldReject: true}, () => AccountManager.createAccount());
      });
    });

    describe('when the request fails', () => {
      withAccountServer([[
        o => true,
        o => fakeResponse(500),
      ]]);

      it('returns a rejected promise', () => {
        return waitsForPromise({shouldReject: true}, () => AccountManager.createAccount({
          email: 'foo@bar.com',
        }));
      });
    });
  });

  describe('.login()', () => {
    describe('when the request succeeds', () => {
      withAccountServer([[
        o => /\/api\/account\/login/.test(o.path),
        o => fakeResponse(200),
      ]], () => {
        it('returns a promise that is resolved after calling the endpoint', () => {
          return waitsForPromise(() => AccountManager.login({
            email: 'foo@bar.com',
            password: 'foo',
          }).then(() => {
            expect(AccountManager.client.request.called).to.be.ok();
          }));
        });

        it('calls the provided callback', () => {
          const spy = sinon.spy();
          return waitsForPromise(() => AccountManager.login({
            email: 'foo@bar.com',
            password: 'foo',
          }, spy).then(() => {
            expect(spy.called).to.be.ok();
          }));
        });
      });
    });

    describe('when called without an email', () => {
      withAccountServer();

      it('returns a rejected promise', () => {
        return waitsForPromise({shouldReject: true}, () =>
          AccountManager.login({
            password: 'foo',
          }));
      });
    });

    describe('when called without a password', () => {
      withAccountServer();

      it('returns a rejected promise', () => {
        return waitsForPromise({shouldReject: true}, () =>
          AccountManager.login({
            email: 'foo@bar.com',
          }));
      });
    });

    describe('when called without any data', () => {
      withAccountServer();

      it('returns a rejected promise', () => {
        return waitsForPromise({shouldReject: true}, () => AccountManager.login());
      });
    });

    describe('when the request fails', () => {
      withAccountServer([[
        o => true,
        o => fakeResponse(500),
      ]]);

      it('returns a rejected promise', () => {
        return waitsForPromise({shouldReject: true}, () => AccountManager.login({
          email: 'foo@bar.com',
        }));
      });
    });
  });

  describe('.resetPassword()', () => {
    describe('when the request succeeds', () => {
      withAccountServer([[
        o => /\/account\/reset-password\/request/.test(o.path),
        o => fakeResponse(200),
      ]], () => {
        it('returns a promise that is resolved after calling the endpoint', () => {
          return waitsForPromise(() => AccountManager.resetPassword({
            email: 'foo@bar.com',
          }).then(() => {
            expect(AccountManager.client.request.called).to.be.ok();
          }));
        });

        it('calls the provided callback', () => {
          const spy = sinon.spy();
          return waitsForPromise(() => AccountManager.resetPassword({
            email: 'foo@bar.com',
          }, spy).then(() => {
            expect(spy.called).to.be.ok();
          }));
        });
      });
    });

    describe('when called without an email', () => {
      withAccountServer();

      it('returns a rejected promise', () => {
        return waitsForPromise({shouldReject: true}, () => AccountManager.resetPassword({}));
      });
    });

    describe('when called without any data', () => {
      withAccountServer();

      it('returns a rejected promise', () => {
        return waitsForPromise({shouldReject: true}, () => AccountManager.resetPassword());
      });
    });

    describe('when the request fails', () => {
      withAccountServer([[
        o => true,
        o => fakeResponse(500),
      ]]);

      it('returns a rejected promise', () => {
        return waitsForPromise({shouldReject: true}, () => AccountManager.resetPassword({
          email: 'foo@bar.com',
        }));
      });
    });
  });
});
