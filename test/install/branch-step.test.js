'use strict';

const expect = require('expect.js');
const sinon = require('sinon');
const BranchStep = require('../../lib/install/branch-step');
const {waitsForPromise} = require('kite-connector/test/helpers/async');

const dummyStep = (match = true) => {
  return {
    match() { return match; },
    step: {
      start: sinon.stub().callsFake(() => {
        return Promise.resolve();
      }),
    },
  };
};

describe('BranchStep', () => {
  let branch, step1, step2;

  describe('when the condition for a step is met', () => {
    beforeEach(() => {
      step1 = dummyStep();
      step2 = dummyStep();
      branch = new BranchStep([step1, step2]);
    });

    it('calls the corresponding step start method', () => {
      return waitsForPromise(() => branch.start().then((data) => {
        expect(data.step).to.eql(step1.step);
      }));
    });
  });

  describe('when no steps conditions are met', () => {
    beforeEach(() => {
      step1 = dummyStep(false);
      step2 = dummyStep(false);
      branch = new BranchStep([step1, step2]);
    });

    it('rejects the whole promise', () => {
      return waitsForPromise({shouldReject: true}, () => branch.start());
    });
  });
});
