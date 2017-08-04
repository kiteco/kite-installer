'use strict'

const fs = require('fs');
const os = require('os');

const compatibility = require('../lib/compatibility');
const StateController = require('../lib/state-controller');

require('./spec-helpers');

describe('compatibility', () => {
  describe('.check()', () => {
    describe('when the user is not an admin', () => {
      beforeEach(() => {
        spyOn(StateController, 'isAdmin').andReturn(false);
        spyOn(fs, 'existsSync').andReturn(false);
        spyOn(atom.packages, 'getLoadedPackage').andReturn(null);
      });
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => compatibility.check());
      });
    });

    describe('when Kite is already installed', () => {
      beforeEach(() => {
        spyOn(StateController, 'isAdmin').andReturn(true);
        spyOn(fs, 'existsSync').andReturn(true);
        spyOn(atom.packages, 'getLoadedPackage').andReturn(null);
      });
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => compatibility.check());
      });
    });

    describe('when the Kite plugin is already installed', () => {
      beforeEach(() => {
        spyOn(StateController, 'isAdmin').andReturn(true);
        spyOn(fs, 'existsSync').andReturn(false);
        spyOn(atom.packages, 'getLoadedPackage').andReturn(true);
      });
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => compatibility.check());
      });
    });

    describe('when the OS is not macOS or Windows', () => {
      beforeEach(() => {
        spyOn(StateController, 'isAdmin').andReturn(true);
        spyOn(fs, 'existsSync').andReturn(false);
        spyOn(atom.packages, 'getLoadedPackage').andReturn(null);
        spyOn(os, 'platform').andReturn('linux');
      });
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => compatibility.check());
      });
    });

    describe('when the OS is macOS', () => {
      beforeEach(() => {
        spyOn(StateController, 'isAdmin').andReturn(true);
        spyOn(fs, 'existsSync').andReturn(false);
        spyOn(atom.packages, 'getLoadedPackage').andReturn(null);
        spyOn(os, 'platform').andReturn('darwin');
      });
      describe('and the release is before 14.0.0', () => {
        beforeEach(() => {
          spyOn(os, 'release').andReturn('13.9.9');
        });
        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () => compatibility.check());
        });
      });
      describe('and the release is at least 14.0.0', () => {
        beforeEach(() => {
          spyOn(os, 'release').andReturn('14.0.0');
        });
        it('returns a resolved promise', () => {
          waitsForPromise({shouldReject: false}, () => compatibility.check());
        });
      });
    });

    describe('when the OS is Windows', () => {
      beforeEach(() => {
        spyOn(StateController, 'isAdmin').andReturn(true);
        spyOn(fs, 'existsSync').andReturn(false);
        spyOn(atom.packages, 'getLoadedPackage').andReturn(null);
        spyOn(os, 'platform').andReturn('win32');
      });
      describe('and the release is before 6.1.0', () => {
        beforeEach(() => {
          spyOn(os, 'release').andReturn('6.0.9');
          spyOn(StateController, 'arch').andReturn('64bit');
        });
        it('returns a rejected promise', () => {
          waitsForPromise({shouldReject: true}, () => compatibility.check());
        });
      });
      describe('and the release is at least 6.1.0', () => {
        beforeEach(() => {
          spyOn(os, 'release').andReturn('6.1.0');
        });
        describe('and the architecture is 32-bit', () => {
          beforeEach(() => {
            spyOn(StateController, 'arch').andReturn('32bit');
          });
          it('returns a rejected promise', () => {
            waitsForPromise({shouldReject: true}, () => compatibility.check());
          });
        });
        describe('and the architecture is 64-bit', () => {
          beforeEach(() => {
            spyOn(StateController, 'arch').andReturn('64bit');
          });
          it('returns a rejected promise', () => {
            waitsForPromise({shouldReject: false}, () => compatibility.check());
          });
        });
      });
    });
  });
});
