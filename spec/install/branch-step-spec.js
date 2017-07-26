'use strict';

const BranchStep = require('../../lib/install/branch-step');

const dummyStep = (match = true) => {
  return {
    match() { return match; },
    start: jasmine.createSpy().andCallFake(() => {
      return Promise.resolve();
    }),
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
      waitsForPromise(() => branch.start().then(() => {
        expect(step1.start).toHaveBeenCalled();
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
      waitsForPromise({shouldReject: true}, () => branch.start());
    });
  });
});
