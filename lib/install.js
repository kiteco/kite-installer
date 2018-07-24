'use strict';

const Emitter = require('./install/emitter');
const Flow = require('./install/flow');
const {deepMerge} = require('kite-connector/lib/utils');

module.exports = class Install {
  /*
  interface Step {
    get name : String
    get failureStep : String
    get view : HTMLElement?
    start(state : Object, install : Install) : Promise
  }
  */
  constructor(steps, state = {}, options = {}) {
    this.emitter = new Emitter();
    this.flow = new Flow(steps, options);
    this.state = state;
    this.options = options;
  }

  getTitle() {
    return this.options.title || 'Kite Install';
  }

  // Atom is using `on` unless these methods exists, so to avoid any issue
  // we have them defined here.
  onDidChangeTitle() {}
  onDidChangeModified() {}

  on(event, listener) {
    return this.emitter.on(event, listener);
  }

  observeState(listener) {
    listener && listener(this.state);
    return this.onDidUdpdateState(listener);
  }

  onDidDestroy(listener) {
    return this.emitter.on('did-destroy', listener);
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

  destroy() {
    this.emit('did-destroy');
  }


  getCurrentStepView() {
    const step = this.getCurrentStep();
    return step && step.getView();
  }

  getCurrentStep() {
    return this.flow.getCurrentStep();
  }

  updateState(o) {
    this.state = deepMerge(this.state, o);
    if (o && o.error === null) {
      delete this.state.error;
    }
    this.emitter.emit('did-update-state', this.state);
    // console.log('new state', JSON.stringify(this.state, null, 2));
  }
};
