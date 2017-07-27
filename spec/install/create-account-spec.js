'use strict';

const CreateAccount = require('../../lib/install/create-account');
const AccountManager = require('../../lib/account-manager');
const {withFakeServer, fakeResponse, withAccountManager} = require('../spec-helpers');

describe('CreateAccount', () => {
  let step, promise;

  withAccountManager();

  beforeEach(() => {
    step = new CreateAccount();
    spyOn(AccountManager, 'createAccount').andCallThrough();
  });

  describe('with a valid email', () => {
    withFakeServer([[
      o => o.method === 'POST' && o.path === '/api/account/createPasswordless',
      o => fakeResponse(200),
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
        expect(AccountManager.createAccount).toHaveBeenCalledWith({
          email: 'some.email@company.com',
        });
      });

      it('returns a promise that resolve when the request succeeds', () => {
        waitsForPromise(() => promise);
      });
    });
  });
});
