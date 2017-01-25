'use strict';

const os = require('os');
const StateController = require('../../lib/state-controller');

describe('StateController - No Support', () => {
  beforeEach(() => {
    spyOn(os, 'platform').andReturn('wtf!');
  });

  describe('.isKiteSupported()', () => {
    it('returns a rejected promise', () => {
      waitsForPromise({
        shouldReject: true,
      }, () => StateController.isKiteSupported());
    });
  });

  describe('.isKiteInstalled()', () => {
    it('returns a rejected promise', () => {
      waitsForPromise({
        shouldReject: true,
      }, () => StateController.isKiteInstalled());
    });
  });

  describe('.installKite()', () => {
    it('returns a rejected promise', () => {
      waitsForPromise({
        shouldReject: true,
      }, () => StateController.installKite());
    });
  });

  describe('.downloadKite()', () => {
    it('returns a rejected promise', () => {
      waitsForPromise({
        shouldReject: true,
      }, () => StateController.downloadKite());
    });
  });

  describe('.isKiteRunning()', () => {
    it('returns a rejected promise', () => {
      waitsForPromise({
        shouldReject: true,
      }, () => StateController.isKiteRunning());
    });
  });

  describe('.canRunKite()', () => {
    it('returns a rejected promise', () => {
      waitsForPromise({
        shouldReject: true,
      }, () => StateController.canRunKite());
    });
  });

  describe('.runKite()', () => {
    it('returns a rejected promise', () => {
      waitsForPromise({
        shouldReject: true,
      }, () => StateController.runKite());
    });
  });

});
