'use strict';

const expect = require('expect.js');
const sinon = require('sinon');
const {waitsForPromise} = require('kite-connector/test/helpers/async');
const Flow = require('../../lib/install/flow');
const DummyStep = require('../helpers/dummy-step');

describe('Flow', () => {
  let flow, steps, install;

  beforeEach(() => {
    install = {
      state: {},
      updateState: sinon.spy(),
    };
  });

  describe('with no steps', () => {
    it('resolves immediately when executed', () => {
      flow = new Flow();

      return waitsForPromise(() => flow.start({}, install));
    });
  });

  describe('with an array of steps', () => {
    let stepResults, spy;

    beforeEach(() => {
      stepResults = [];
      steps = [
        new DummyStep((step) => {
          stepResults.push('step 1');
          step.resolve(1);
        }),
        new DummyStep((step) => {
          stepResults.push('step 2');
          step.resolve(2);
        }),
      ];
      flow = new Flow(steps);
      spy = sinon.spy();
      flow.onDidChangeCurrentStep(spy);
    });

    it('executes provided steps successively', () => {
      return waitsForPromise(() => flow.start({}, install))
      .then(() => {
        expect(stepResults).to.eql(['step 1', 'step 2']);
      });
    });

    it('notifies the change step listener each time', () => {
      return waitsForPromise(() => flow.start({}, install))
      .then(() => {
        expect(spy.called).to.be.ok();
      });
    });

    it('updates the install state using steps resolution value', () => {
      return waitsForPromise(() => flow.start({}, install))
      .then(() => {
        expect(install.updateState.calledWith(1)).to.be.ok();
        expect(install.updateState.calledWith(2)).to.be.ok();
      });
    });

    it('resolves with the last step data', () => {
      return waitsForPromise(() => flow.start({}, install))
      .then((data) => {
        expect(data).to.eql(2);
      });
    });
  });

  describe('with a step that resolve with a step name', () => {
    beforeEach(() => {
      steps = [
        new DummyStep((step) => {
          step.resolve({step: 'goto'});
        }),
        new DummyStep((step) => {
          step.resolve();
        }),
        new DummyStep({name: 'goto'}, (step) => {
          step.resolve();
        }),
      ];
      flow = new Flow(steps);
    });

    it('jumps to the specified step', () => {
      return waitsForPromise(() => flow.start({}, install)).then(() => {
        expect(steps[1].start.called).not.to.be.ok();
        expect(steps[2].start.called).to.be.ok();
      });
    });
  });

  describe('with a step that resolve with a step object', () => {
    let generatedStep;
    beforeEach(() => {
      steps = [
        new DummyStep((step) => {
          generatedStep = new DummyStep(step => step.resolve());
          step.resolve({step: generatedStep});
        }),
        new DummyStep((step) => {
          step.resolve();
        }),
        new DummyStep({name: 'goto'}, (step) => {
          step.resolve();
        }),
      ];
      flow = new Flow(steps);
    });

    it('executes the returned step then follow with the remaining flow', () => {
      return waitsForPromise(() => flow.start({}, install)).then(() => {
        expect(generatedStep.start.called).to.be.ok();
        expect(steps[1].start.called).to.be.ok();
        expect(steps[2].start.called).to.be.ok();
      });
    });
  });

  describe('with a failing step', () => {
    let spy;
    beforeEach(() => {
      spy = sinon.spy();
    });

    describe('with no failure catching step', () => {
      beforeEach(() => {
        steps = [
          new DummyStep((step) => {
            step.reject({data: 'failure 1'});
          }),
          new DummyStep((step) => {
            step.resolve();
          }),
        ];
        flow = new Flow(steps);
        flow.onDidFailStep(spy);
      });

      it('rejects the returned promise at the first step', () => {
        return waitsForPromise({shouldReject: true}, () => flow.start({}, install)).then(() => {
          expect(steps[1].start.called).not.to.be.ok();

          // Removed because we were previously passing in JSON unserializable
          // objects to the installer, resulting in a circular object error. That
          // logic has been removed, so this check had to be removed as well.
          //
          // expect(install.updateState.calledWith('failure 1')).to.be.ok();
        });
      });

      it('emits a did-fail-step event', () => {
        return waitsForPromise({shouldReject: true}, () => flow.start({}, install)).then(() => {
          expect(spy.called).to.be.ok();
        });
      });
    });

    describe('with a global failure catching step', () => {
      beforeEach(() => {
        steps = [
          new DummyStep((step) => {
            step.reject({data: 'failure 1'});
          }),
          new DummyStep((step) => {
            step.resolve();
          }),
          new DummyStep({name: 'catch'}, (step) => {
            step.resolve();
          }),
        ];
        flow = new Flow(steps, {failureStep: 'catch'});
        flow.onDidFailStep(spy);
      });

      it('stops after the first step and branch to the failure step', () => {
        return waitsForPromise(() => flow.start({}, install)).then(() => {
          expect(steps[1].start.called).not.to.be.ok();
          expect(steps[2].start.called).to.be.ok();
        });
      });

      it('emits a did-fail-step event', () => {
        return waitsForPromise(() => flow.start({}, install)).then(() => {
          expect(spy.called).to.be.ok();
        });
      });
    });

    describe('with a local failure catching step', () => {
      beforeEach(() => {
        steps = [
          new DummyStep({failureStep: 'catch-local'}, (step) => {
            step.reject({data: 'failure 1'});
          }),
          new DummyStep((step) => {
            step.resolve();
          }),
          new DummyStep({name: 'catch'}, (step) => {
            step.resolve();
          }),
          new DummyStep({name: 'catch-local'}, (step) => {
            step.resolve();
          }),
        ];
        flow = new Flow(steps, {failureStep: 'catch'});
        flow.onDidFailStep(spy);
      });

      it('stops after the first step and branch to the specified failure step', () => {
        return waitsForPromise(() => flow.start({}, install)).then(() => {
          expect(steps[1].start.called).not.to.be.ok();
          expect(steps[2].start.called).not.to.be.ok();
          expect(steps[3].start.called).to.be.ok();
        });
      });

      it('emits a did-fail-step event', () => {
        return waitsForPromise(() => flow.start({}, install)).then(() => {
          expect(spy.called).to.be.ok();
        });
      });
    });
  });
});
