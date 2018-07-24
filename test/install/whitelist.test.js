'use strict';

const expect = require('expect.js');
const sinon = require('sinon');
const KiteAPI = require('kite-api');

const {waitsForPromise} = require('kite-connector/test/helpers/async');
const Whitelist = require('../../lib/install/whitelist');
const {startStep} = require('../spec-helpers');

describe('Whitelist', () => {
  let stubWhitelist, step;

  beforeEach(() => {
    step = new Whitelist({
      tries: 3,
      cooldown: 0,
    });
  });
  afterEach(() => {
    stubWhitelist && stubWhitelist.restore();
  });

  describe('when the request succeeds', () => {
    beforeEach(() => {
      stubWhitelist = sinon.stub(KiteAPI, 'whitelistPath').returns(Promise.resolve());
    });

    it('the install step succeeds', () => {
      return waitsForPromise(() => startStep(step, {
        path: '/path/to/dir',
      }))
      .then(result => {
        expect(result).to.eql({whitelist: 'complete'});
      });
    });
  });

  describe('when the request fails because the path is aready whitelisted', () => {
    beforeEach(() => {
      stubWhitelist = sinon.stub(KiteAPI, 'whitelistPath').returns(Promise.reject({
        data: KiteAPI.STATES.WHITELISTED,
      }));
    });

    it('the install step succeeds', () => {
      return waitsForPromise(() => startStep(step, {
        path: '/path/to/dir',
      }))
      .then(result => {
        expect(result).to.eql({whitelist: 'complete'});
      });
    });
  });

  describe('when the request fails for another reason', () => {
    beforeEach(() => {
      stubWhitelist = sinon.stub(KiteAPI, 'whitelistPath').returns(Promise.reject({}));
    });

    it('the install step fails', () => {
      return waitsForPromise({shouldReject: true}, () => startStep(step, {
        path: '/path/to/dir',
      }));
    });
  });

  describe('when no path is provided to the step', () => {
    beforeEach(() => {
      stubWhitelist = sinon.stub(KiteAPI, 'whitelistPath').returns(Promise.resolve({}));
    });

    it('the install step succeeds with no calls to whitelist endpoint', () => {
      return waitsForPromise(() => startStep(step, {}))
      .then(() => {
        expect(KiteAPI.whitelistPath.called).not.to.be.ok();
      });
    });
  });

  describe('when the skipped option have been picked', () => {
    beforeEach(() => {
      stubWhitelist = sinon.stub(KiteAPI, 'whitelistPath').returns(Promise.resolve({}));
    });

    it('the install step succeeds with no calls to whitelist endpoint', () => {
      return waitsForPromise(() => startStep(step, {
        whitelist: 'skipped',
      }))
      .then(() => {
        expect(KiteAPI.whitelistPath.called).not.to.be.ok();
      });
    });
  });
});
