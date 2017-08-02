'use strict';

const Emitter = require('./install/emitter');
const Flow = require('./install/flow');

const deepMerge = (a, b) => {
  a = JSON.parse(JSON.stringify(a || {}));
  b = JSON.parse(JSON.stringify(b || {}));
  const c = Object.assign({}, a);

  Object.keys(b).forEach(k => {
    if (c[k] && typeof c[k] == 'object') {
      c[k] = deepMerge(c[k], b[k]);
    } else {
      c[k] = b[k];
    }
  });

  return c;
};

module.exports = class Install {
  /*
  interface Step {
    get name : String
    get failureStep : String
    get view : HTMLElement?
    start(data : *, err : Error, install : Install) : Promise
  }
  */
  constructor(steps, state) {
    this.emitter = new Emitter();
    this.flow = new Flow(steps);
    this.state = state || {};

    this.flow.onDidGetStepData(data => this.updateState(data));
  }

  getTitle() {
    return 'Kite Install';
  }

  // Atom is using `on` unless these methods exists, so to avoid any issue
  // we have them defined here.
  onDidChangeTitle() {}
  onDidChangeModified() {}

  on(event, listener) {
    this.emitter.on(event, listener);
  }

  observeState(listener) {
    listener && listener(this.state);
    return this.onDidUdpdateState(listener);
  }

  onDidUdpdateState(listener) {
    return this.emitter.on('did-update-state', listener);
  }

  onDidChangeCurrentStep(listener) {
    return this.flow.onDidChangeCurrentStep(listener);
  }

  start() {
    return this.flow.start(this.state, this);
  }

  emit(event, data) {
    this.emitter.emit(event, data);
  }


  getCurrentStepView() {
    const step = this.getCurrentStep();
    return step && step.view;
  }

  getCurrentStep() {
    return this.flow.getCurrentStep();
  }

  updateState(o) {
    this.state = deepMerge(this.state, o);
    this.emitter.emit('did-update-state', this.state);
    console.log('new state', JSON.stringify(this.state, null, 2));
  }
};
