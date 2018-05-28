'use strict';

const sinon = require('sinon');
const {waitsForPromise} = require('kite-connect/test/helpers/async');
const ParallelSteps = require('../../lib/install/parallel-steps');

const dummyStep = (resolve = true) => {
  return {
    start: sinon.stub().callsFake(() => {
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
      return waitsForPromise(() => steps.start());
    });
  });

  describe('when one substeps fails', () => {
    beforeEach(() => {
      step1 = dummyStep();
      step2 = dummyStep(false);
      steps = new ParallelSteps([step1, step2]);
    });

    it('rejects the whole promise', () => {
      return waitsForPromise({shouldReject: true}, () => steps.start());
    });
  });
});
