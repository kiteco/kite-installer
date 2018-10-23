'use strict';

const Emitter = require('./emitter');
const BaseStep = require('./base-step');

module.exports = class Flow extends BaseStep {
  constructor(steps = [], options) {
    super(options);
    this.currentStepIndex = 0;
    this.emitter = new Emitter();
    this.steps = steps;
  }

  onDidChangeCurrentStep(listener) {
    return this.emitter.on('did-change-current-step', listener);
  }

  onDidFailStep(listener) {
    return this.emitter.on('did-fail-step', listener);
  }

  start(state, install) {
    this.install = install;
    const firstStep = this.steps[this.currentStepIndex];
    return firstStep
      ? this.executeStep(firstStep)
      : Promise.resolve();
  }

  executeStep(step) {
    if (this.currentStep) { this.currentStep.release(); }

    this.currentStep = step;
    const stepIndex = this.steps.indexOf(step);
    this.currentStepIndex = stepIndex !== -1
      ? stepIndex
      : this.currentStepIndex;

    this.emitter.emit('did-change-current-step', step);

    return step
    .start(this.install.state, this.install)
    .catch((err) => {
      this.emitter.emit('did-fail-step', {error: err, step});

      this.install.updateState({
        error: {
          message: err.message,
          stack: err.stack,
        },
      });

      if (step.failureStep) {
        return this.executeStep(this.getStepByName(step.failureStep));
      } else {
        if (this.options.failureStep && this.getStepByName(this.options.failureStep)) {
          return this.executeStep(this.getStepByName(this.options.failureStep));
        } else {
          throw err;
        }
      }
    })
    .then((data) => {
      if (data && data.step) {
        const step = typeof data.step === 'string'
          ? this.getStepByName(data.step)
          : data.step;
        this.install.updateState(data.data);
        return this.executeStep(step);
      } else {
        this.install.updateState(data);
        return this.executeNextStep(data);
      }
    });
  }

  executeNextStep(data) {
    const nextStep = this.getNextStep(this.currentStepIndex);
    return nextStep
      ? this.executeStep(nextStep)
      : data;
  }

  getCurrentStep() {
    return this.currentStep && this.currentStep.getCurrentStep
      ? this.currentStep.getCurrentStep()
      : this.currentStep;
  }

  getStepByName(name) {
    return this.steps.reduce((m, s) => {
      if (m) { return m; }
      if (s.name === name) { return s; }
      return m;
    }, null);
  }

  getNextStep(index) {
    return this.steps[index + 1];
  }
};
