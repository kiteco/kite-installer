'use strict';

const deepMerge = (a, b) => {
  a = JSON.parse(JSON.stringify(a || {}));
  b = JSON.parse(JSON.stringify(b || {}));
  return Object.assign({}, a, b);
};

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
    this.currentStepIndex = 0;
    this.state = {};
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

  executeStep(step) {
    this.currentStep = step;
    const stepIndex = this.steps.indexOf(step);
    this.currentStepIndex = stepIndex !== -1
      ? stepIndex
      : this.currentStepIndex;

    this.fireChangeCurrentStepEvent();

    return step
    .start(this.state, this)
    .catch((err) => {
      if (step.retryStep) {
        this.updateState({error: err.message});
        return this.executeStep(this.getStepByName(step.retryStep));
      } else {
        throw err;
      }
    })
    .then((data) => {
      if (data && data.step) {
        this.updateState(data.data);
        return this.executeStep(data.step);
      } else {
        this.updateState(data);
        return this.executeNextStep(data);
      }
    });
  }

  updateState(o) {
    this.state = deepMerge(this.state, o);
    console.log('new state', JSON.stringify(this.state, null, 2));
  }

  executeNextStep(data) {
    const nextStep = this.getNextStep(this.currentStepIndex);
    return nextStep
      ? this.executeStep(nextStep)
      : data;
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
