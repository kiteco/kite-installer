'use strict'

const compatibility = require('../lib/compatibility');
const StateController = require('../lib/state-controller');

describe('compatibility', () => {
  describe('.check()', () => {
    describe('when the user is not an admin', () => {
      beforeEach(() => {
        spyOn(StateController, 'isAdmin').andReturn(false);
        spyOn(atom.packages, 'getLoadedPackage').andReturn(undefined);
      });
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => compatibility.check());
      });
    });

    describe('when the Kite plugin is already installed', () => {
      beforeEach(() => {
        spyOn(StateController, 'isAdmin').andReturn(true);
        spyOn(atom.packages, 'getLoadedPackage').andReturn(true);
      });
      it('returns a rejected promise', () => {
        waitsForPromise({shouldReject: true}, () => compatibility.check());
      });
    });

    describe('when the user is an admin and the Kite plugin is not installed', () => {
      beforeEach(() => {
        spyOn(StateController, 'isAdmin').andReturn(true);
        spyOn(atom.packages, 'getLoadedPackage').andReturn(undefined);
      });
      it('returns a resolved promise', () => {
        waitsForPromise({shouldReject: false}, () => compatibility.check());
      });
    });
  });
});
