'use strict';

const ParallelSteps = require('../../lib/install/parallel-steps');

const dummyStep = (resolve = true) => {
  return {
    start: jasmine.createSpy().andCallFake(() => {
      return resolve ? Promise.resolve() : Promise.reject();
    }),
  };
};

describe('ParallelSteps', () => {
  let steps, step1, step2;

  describe('when both substeps succeeds', () => {
    beforeEach(() => {
      step1 = dummyStep();
      step2 = dummyStep();
      steps = new ParallelSteps([step1, step2]);
    });

    it('resolves when both substeps are resolved', () => {
      waitsForPromise(() => steps.start());
    });
  });

  describe('when one substeps fails', () => {
    beforeEach(() => {
      step1 = dummyStep();
      step2 = dummyStep(false);
      steps = new ParallelSteps([step1, step2]);
    });

    it('resolves when both substeps are resolved', () => {
      waitsForPromise({shouldReject: true}, () => steps.start());
    });
  });
});
