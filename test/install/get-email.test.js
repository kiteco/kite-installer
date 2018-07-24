'use strict';

const fs = require('fs');
const expect = require('expect.js');
const sinon = require('sinon');
const {waitsForPromise} = require('kite-connector/test/helpers/async');
const GetEmail = require('../../lib/install/get-email');

describe('GetEmail', () => {
  let step, stub;

  beforeEach(() => {
    step = new GetEmail();
  });

  afterEach(() => {
    stub && stub.restore();
  });

  describe('.start()', () => {
    describe('when the user has a .gitconfig file', () => {
      beforeEach(() => {
        stub = sinon.stub(fs, 'readFileSync').returns(`[user]
	email = some.email@company.com`);
      });

      it('returns a promise that is resolved with the user email', () => {
        return waitsForPromise(() => step.start().then(data => {
          expect(data.account.email).to.eql('some.email@company.com');
        }));
      });
    });

    describe('when the user has a .gitconfig file without an email', () => {
      beforeEach(() => {
        stub = sinon.stub(fs, 'readFileSync').returns('');
      });

      it('returns a promise that is resolved with null', () => {
        return waitsForPromise(() => step.start().then(data => {
          expect(data).to.eql({account: { email: undefined }});
        }));
      });
    });

    describe('when the user has no .gitconfig file', () => {
      beforeEach(() => {
        stub = sinon.stub(fs, 'readFileSync').returns(() => { throw new Error(); });
      });

      it('returns a promise that is resolved with null', () => {
        return waitsForPromise(() => step.start().then(data => {
          expect(data).to.eql({account: { email: undefined }});
        }));
      });
    });
  });
});
