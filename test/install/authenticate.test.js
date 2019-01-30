'use strict';

const expect = require('expect.js');
const sinon = require('sinon');
const KiteAPI = require('kite-api');

const {waitsForPromise} = require('kite-connector/test/helpers/async');
const Authenticate = require('../../lib/install/authenticate');
const {startStep} = require('../spec-helpers');

describe('Authenticate', () => {
  let stubAuth, stubIsAuth, step;

  beforeEach(() => {
    step = new Authenticate({
      tries: 3,
      cooldown: 0,
    });
  });

  afterEach(() => {
    stubAuth && stubAuth.restore();
    stubIsAuth && stubIsAuth.restore();
  });

  it('has default values for retries and cooldown', () => {
    const step = new Authenticate();

    expect(step.tries).to.eql(10);
    expect(step.cooldown).to.eql(1500);
  });

  describe('when the request succeeds and the user is correctly authenticated', () => {
    beforeEach(() => {
      stubAuth = sinon.stub(KiteAPI, 'authenticateSessionID').returns(Promise.resolve());
      stubIsAuth = sinon.stub(KiteAPI, 'isUserAuthenticated').returns(Promise.resolve());
    });

    it('the install test succeeds', () => {
      return waitsForPromise(() => startStep(step, {
        account: {
          sessionId: 'session-id',
        },
      }));
    });
  });

  describe('when the state has no session id', () => {
    beforeEach(() => {
      stubAuth = sinon.stub(KiteAPI, 'authenticateSessionID').returns(Promise.resolve());
      stubIsAuth = sinon.stub(KiteAPI, 'isUserAuthenticated').returns(Promise.resolve());
    });

    it('the install step fails', () => {
      return waitsForPromise({shouldReject: true}, () => startStep(step, {
        account: {},
      }));
    });
    it('the install step fails', () => {
      return waitsForPromise({shouldReject: true}, () => startStep(step, {}));
    });
  });

  describe('when the auth request fails', () => {
    beforeEach(() => {
      stubAuth = sinon.stub(KiteAPI, 'authenticateSessionID').returns(Promise.reject());
      stubIsAuth = sinon.stub(KiteAPI, 'isUserAuthenticated').returns(Promise.reject());
    });

    it('the install step fails', () => {
      return waitsForPromise({shouldReject: true}, () => startStep(step, {
        account: {
          sessionId: 'session-id',
        },
      }));
    });
  });

  //describe('when the is auth request fails', () => {
  //  beforeEach(() => {
  //    stubAuth = sinon.stub(KiteAPI, 'authenticateSessionID').returns(Promise.resolve());
  //    stubIsAuth = sinon.stub(KiteAPI, 'isUserAuthenticated').returns(Promise.reject());
  //  });

  //  it('the install step fails', () => {
  //    return waitsForPromise({shouldReject: true}, () => startStep(step, {
  //      account: {
  //        sessionId: 'session-id',
  //      },
  //    }));
  //  });
  //});
});
