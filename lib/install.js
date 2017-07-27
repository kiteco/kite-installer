'use strict';

module.exports = class Install {
  /*
  interface Step {
    get name : String
    get retryStep : String
    get view : HTMLElement?
    start(data : *, err : Error, install : Install) : Promise
  }
  */
  constructor(steps) {
    this.steps = steps;
    this.listeners = [];
    this.dataPerStep = {};
    this.currentStepIndex = 0;
  }

  getTitle() {
    return 'Kite Install';
  }

  onDidChangeCurrentStep(listener) {
    if (listener && !this.listeners.includes(listener)) {
      this.listeners.push(listener);
      return {
        dispose: () => {
          this.listeners = this.listeners.filter(l => l !== listener);
        },
      };
    } else {
      return {
        dispose: () => {},
      };
    }
  }

  fireChangeCurrentStepEvent() {
    this.listeners.forEach(f => f(this));
  }

  start() {
    const firstStep = this.steps[this.currentStepIndex];
    return firstStep
      ? this.executeStep(firstStep)
      : Promise.resolve();
  }

  executeStep(step, data, err) {
    this.currentStep = step;
    const stepIndex = this.steps.indexOf(step);
    this.currentStepIndex = stepIndex !== -1
      ? stepIndex
      : this.currentStepIndex;

    this.fireChangeCurrentStepEvent();

    data = data || this.dataPerStep[step.name];
    this.dataPerStep[step.name] = data;

    return step
    .start(data, err, this)
    .catch((err) => {
      if (step.retryStep) {
        return this.executeStep(this.getStepByName(step.retryStep), err.data, err);
      } else {
        throw err;
      }
    })
    .then((data) => this.executeNextStep(data));
  }

  executeNextStep(data) {
    if (data && data.step) {
      return this.executeStep(data.step, data.data);
    } else {
      const nextStep = this.getNextStep(this.currentStepIndex);
      return nextStep
        ? this.executeStep(nextStep, data)
        : data;
    }
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
