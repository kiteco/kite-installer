
'use strict';

const os = require('os');
// const https = require('https');
// const proc = require('child_process');
const StateController = require('../../lib/state-controller');
// const WindowsSupport = require('../../lib/support/windows');

const {
  fakeKiteInstallPaths, /*fakeProcesses, fakeResponse,
  withKiteInstalled, withKiteRunning, withKiteNotRunning,
  withFakeServer,*/
} = require('../spec-helpers.js');

describe('StateController - Windows Support', () => {
  beforeEach(() => {
    spyOn(os, 'platform').andReturn('win32');
    spyOn(os, 'release').andReturn('6.1.3'); // NT6.1 = Windows 7
    spyOn(os, 'arch').andReturn('x64'); // NT6.1 = Windows 7
  });

  fakeKiteInstallPaths();

  describe('.isKiteSupported()', () => {
    it('returns a resolved promise', () => {
      waitsForPromise(() => StateController.isKiteSupported());
    });

    describe('when the os release is below 6.1', () => {
      beforeEach(() => {
        os.release.andReturn('6.0.4'); // NT6.0 = Windows Vista
      });

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.isKiteSupported());
      });
    });

    describe('when the arch is not 64bit', () => {
      beforeEach(() => {
        os.arch.andReturn('x86');
      });

      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => StateController.isKiteSupported());
      });
    });
  });
});
