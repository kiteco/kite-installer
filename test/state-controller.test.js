'use strict';

const sinon = require('sinon');
const expect = require('expect.js');
const KiteAPI = require('kite-api');
const KiteConnector = require('kite-connector');
const StateController = require('../lib/state-controller');

describe('StateController', () => {

  describe('.support', () => {
    it('returns the connector adapter', () => {
      expect(StateController.support).to.eql(KiteConnector.adapter);
    });
  });

  [
    'releaseURL',
    'downloadPath',
    'installPath',
  ].forEach(key => {
    describe(`.${key}`, () => {
      it('proxy the getter to KiteConnector.adapter', () => {
        expect(StateController[key]).to.eql(KiteConnector.adapter[key]);
      });
    });
  });

  [
    ['handleState', 'checkHealth'],
  ].forEach(([a, b]) => {
    describe(`.${a}()`, () => {
      let stub;

      beforeEach(() => {
        stub = sinon.stub(KiteAPI, b);
      });

      afterEach(() => {
        stub.restore();
      });

      it(`proxy the call to KiteAPI.${b}`, () => {
        StateController[a]();
        expect(KiteAPI[b].called).to.be.ok();
      });
    });
  });

  [
    'arch',
    'isAdmin',
    'isOSSupported',
    'isOSVersionSupported',
    'hasManyKiteInstallation',
    'hasManyKiteEnterpriseInstallation',
    'hasBothKiteInstalled',
  ].forEach(method => {
    describe(`.${method}()`, () => {
      let stub;

      beforeEach(() => {
        stub = sinon.stub(KiteConnector.adapter, method);
      });

      afterEach(() => {
        stub.restore();
      });

      it(`proxy the call to KiteConnector.adapter.${method}`, () => {
        StateController[method]();
        expect(KiteConnector.adapter[method].called).to.be.ok();
      });
    });
  });

  [
    'isKiteSupported',
    'isKiteInstalled',
    'isKiteEnterpriseInstalled',
    'canInstallKite',
    'downloadKiteRelease',
    'downloadKite',
    'installKite',
    'isKiteRunning',
    'canRunKite',
    'runKite',
    'runKiteAndWait',
    'isKiteEnterpriseRunning',
    'canRunKiteEnterprise',
    'runKiteEnterprise',
    'runKiteEnterpriseAndWait',
    'isKiteReachable',
    'waitForKite',
    'isUserAuthenticated',
    'canAuthenticateUser',
    'authenticateUser',
    'authenticateSessionID',
    'saveUserID',
  ].forEach(method => {
    describe(`.${method}()`, () => {
      let stub;

      beforeEach(() => {
        stub = sinon.stub(KiteAPI, method);
      });

      afterEach(() => {
        stub.restore();
      });

      it('proxy the call to KiteAPI', () => {
        StateController[method]();
        expect(KiteAPI[method].called).to.be.ok();
      });
    });
  });
});
