'use strict';

const fs = require('fs');
const GetEmail = require('../../lib/install/get-email');

describe('GetEmail', () => {
  let step;

  beforeEach(() => {
    step = new GetEmail();
  });

  describe('.start()', () => {
    describe('when the user has a .gitconfig file', () => {
      beforeEach(() => {
        spyOn(fs, 'readFileSync').andReturn(`[user]
	email = some.email@company.com`);
      });

      it('returns a promise that is resolved with the user email', () => {
        waitsForPromise(() => step.start().then(data => {
          expect(data.email).toEqual('some.email@company.com');
        }));
      });
    });

    describe('when the user has a .gitconfig file without an email', () => {
      beforeEach(() => {
        spyOn(fs, 'readFileSync').andReturn('');
      });

      it('returns a promise that is resolved with null', () => {
        waitsForPromise(() => step.start().then(data => {
          expect(data).toEqual({email: undefined});
        }));
      });
    });

    describe('when the user has no .gitconfig file', () => {
      beforeEach(() => {
        spyOn(fs, 'readFileSync').andCallFake(() => { throw new Error(); });
      });

      it('returns a promise that is resolved with null', () => {
        waitsForPromise(() => step.start().then(data => {
          expect(data).toEqual({email: undefined});
        }));
      });
    });
  });
});
