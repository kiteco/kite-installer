'use strict';

const expect = require('expect.js');
const sinon = require('sinon');
const {fakeResponse} = require('kite-connector/test/helpers/http');
const {waitsForPromise} = require('kite-connector/test/helpers/async');

const CreateAccount = require('../../lib/install/create-account');
const AccountManager = require('../../lib/account-manager');
const {withAccountServer} = require('../spec-helpers');

describe('CreateAccount', () => {
  let step, promise, spy;

  beforeEach(() => {
    step = new CreateAccount();
    spy = sinon.spy(AccountManager, 'createAccount');
  });

  afterEach(() => {
    spy.restore();
  });

  describe('when the endpoint responds with an error', () => {
    withAccountServer([[
      o => o.method === 'POST' && o.path === '/api/account/createPasswordless',
      o => fakeResponse(401, '', {
        headers: {
          'set-cookie': ['kite-session=foobar'],
        },
      }),
    ]], () => {
      beforeEach(() => {
        promise = step.start({
          account: {
            email: 'some.email@company.com',
            invalid: false,
            exists: false,
            hasPassword: false,
            reason: null,
          },
        });
      });

      it('returns a promise that reject', () => {
        return waitsForPromise({shouldReject: true}, () => promise);
      });
    });
  });

  describe('with a valid email', () => {
    withAccountServer([[
      o => o.method === 'POST' && o.path === '/api/account/createPasswordless',
      o => fakeResponse(200, '', {
        headers: {
          'set-cookie': ['kite-session=foobar'],
        },
      }),
    ]], () => {
      beforeEach(() => {
        promise = step.start({
          account: {
            email: 'some.email@company.com',
            invalid: false,
            exists: false,
            hasPassword: false,
            reason: null,
          },
        });
      });

      it('calls the account creation endpoint', () => {
        expect(AccountManager.createAccount.calledWith({
          email: 'some.email@company.com',
        })).to.be.ok();
      });

      it('returns a promise that resolve when the request succeeds', () => {
        return waitsForPromise(() => promise.then(state => {
          expect(state.account.sessionId).to.eql('foobar');
        }));
      });
    });
  });
});
