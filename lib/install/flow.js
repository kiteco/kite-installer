'use strict';

const Emitter = require('./emitter');
const BaseStep = require('./base-step');
const CompositeDisposable = require('./composite-disposable');

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

  updateStatusBar() {
    let statusBar = this.getStatusBar();
    if (!statusBar) {
      return;
    }

    if (!this.statusElement) {
      this.statusElement = document.createElement('div');
      this.statusElement.className = 'kite-install-status';
      this.statusElement.classList.add('inline-block');

      let statusElement = this.statusElement;

      let subscriptions = new CompositeDisposable();
      subscriptions.add(atom.tooltips.add(statusElement, {
        title: 'Kite will start automatically after being installed'
      }));

      let statusBarTile = statusBar.addRightTile({item: statusElement});

      function destroyTile() {
        if (subscriptions) {
          subscriptions.dispose();
          subscriptions = null;
        }
        if (statusBarTile) {
          statusBarTile.destroy();
          statusBarTile = null;
        }
      }

      subscriptions.add(this.install.on('encountered-fatal-error', () => {
        destroyTile();
      }));

      let currentStatusText;
      subscriptions.add(this.install.observeState((state) => {
        let newStatusText;
        if (state.download) {
          newStatusText = 'Downloading Kite';
          if (state.download.done) {
            newStatusText = 'Installing Kite';
          }
        }

        if (state.install) {
          newStatusText = 'Installing Kite';
        }

        if (state.running) {
          newStatusText = 'Starting Kite';
        }

        if (state.plugin) {
          if (state.plugin.done) {
            destroyTile();
            newStatusText = "";
          } else {
            newStatusText = 'Installing Kite plugin';
          }
        }

        if (newStatusText && newStatusText !== currentStatusText) {
          currentStatusText = newStatusText;
          statusElement.innerHTML = `<span class="loading loading-spinner-tiny inline-block icon"></span><span class="text"> ${newStatusText}</span>`;
        }
      }));
    }
  }

  start(state, install) {
    this.install = install;
    const firstStep = this.steps[this.currentStepIndex];
    if (firstStep) {
      this.updateStatusBar();
      return this.executeStep(firstStep);
    }
    return Promise.resolve();
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
