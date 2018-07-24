'use strict';

const expect = require('expect.js');
const sinon = require('sinon');
const {waitsForPromise} = require('kite-connector/test/helpers/async');
const ParallelSteps = require('../../lib/install/parallel-steps');

const dummyStep = (resolve = true, data) => {
  return {
    start: sinon.stub().callsFake(() => {
      return resolve ? Promise.resolve(data) : Promise.reject();
    }),
  };
};

describe('ParallelSteps', () => {
  let steps, step1, step2, step3;

  describe('when both substeps succeeds', () => {
    beforeEach(() => {
      step1 = dummyStep(true, {foo: 'bar'});
      step2 = dummyStep(true);
      step3 = dummyStep(true, {bar: 'foo'});
      steps = new ParallelSteps([step1, step2, step3]);
    });

    it('resolves when both substeps are resolved', () => {
      return waitsForPromise(() => steps.start()).then(data => {
        expect(data).to.eql({
          foo: 'bar',
          bar: 'foo',
        });
      });
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

  describe('.getView()', () => {
    describe('when the step has its own view', () => {
      const view = {};

      it('returns this step view', () => {
        step1 = dummyStep();
        step2 = dummyStep(false);
        steps = new ParallelSteps([step1, step2], {view});

        expect(steps.getView()).to.eql(view);
      });
    });

    describe('when a sub step has a view', () => {
      const view = {};

      it('returns this step view', () => {
        step1 = dummyStep();
        step2 = dummyStep(false);
        step2.view = view;
        steps = new ParallelSteps([step1, step2]);

        expect(steps.getView()).to.eql(view);
      });
    });
  });
});
