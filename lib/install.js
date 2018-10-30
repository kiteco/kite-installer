'use strict';

const Emitter = require('./install/emitter');
const Flow = require('./install/flow');
const {deepMerge} = require('kite-connector/lib/utils');
const Rollbar = require('rollbar');
const rollbar = new Rollbar('0d9bba1cb93446a8af003823e0e85ce8');

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

    this.flow.onDidFailStep(({error}) => {
      error && rollbar.error(error, error.data);
    });
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

  onDidFailStep(listener) {
    return this.flow.onDidFailStep(listener);
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
  }
};
