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
    const firstStep = this.steps[0];
    return firstStep
      ? this.executeStep(firstStep)
      : Promise.resolve();
  }

  executeStep(step, data, err) {
    this.currentStep = step;
    this.fireChangeCurrentStepEvent();

    data = data || this.dataPerStep[step.name];
    this.dataPerStep[step.name] = data;

    return step
    .start(data, err, this)
    .catch((err) => {
      if (step.retryStep) {
        return this.executeStep(this.getStepByName(step.retryStep), null, err);
      } else {
        throw err;
      }
    })
    .then((data) => this.executeNextStep(data));
  }

  executeNextStep(data) {
    const nextStep = this.getNextStepByName(this.currentStep.name);
    return nextStep
      ? this.executeStep(nextStep, data)
      : data;
  }

  getStepByName(name) {
    return this.steps.reduce((m, s) => {
      if (m) { return m; }
      if (s.name === name) { return s; }
      return m;
    }, null);
  }

  getNextStepByName(name) {
    return this.steps.reduce((m, s, i, a) => {
      if (m) { return m; }
      if (a[i - 1] && a[i - 1].name === name) { return s; }
      return m;
    }, null);
  }
};
