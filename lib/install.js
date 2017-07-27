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
  constructor(steps, state) {
    this.steps = steps;
    this.listeners = {
      step: [],
      state: [],
    };
    this.currentStepIndex = 0;
    this.state = state || {};
  }

  getTitle() {
    return 'Kite Install';
  }

  observeState(listener) {
    if (listener && !this.listeners.state.includes(listener)) {
      this.listeners.state.push(listener);
      listener(this.state, this);
      return {
        dispose: () => {
          this.listeners.state = this.listeners.state.filter(l => l !== listener);
        },
      };
    } else {
      return {
        dispose: () => {},
      };
    }
  }

  onDidChangeCurrentStep(listener) {
    if (listener && !this.listeners.step.includes(listener)) {
      this.listeners.step.push(listener);
      return {
        dispose: () => {
          this.listeners.step = this.listeners.step.filter(l => l !== listener);
        },
      };
    } else {
      return {
        dispose: () => {},
      };
    }
  }

  fireChangeCurrentStepEvent() {
    this.listeners.step.forEach(f => f(this));
  }

  fireChangeStateEvent() {
    this.listeners.state.forEach(f => f(this.state, this));
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
