'use strict';

const {CompositeDisposable} = require('atom');
const path = require('path');
const Install = require('../../install');
const {logo} =  require('./assets');

const Metrics = require('../../../ext/telemetry/metrics');

class InstallElement extends HTMLElement {
  static initClass() {
    const elementClass = document.registerElement('kite-atom-install', {
      prototype: this.prototype,
    });
    atom.themes.requireStylesheet(path.resolve(__dirname, '..', '..', '..', 'styles', 'install.less'));
    atom.views.addViewProvider(Install, model => {
      const element = new elementClass();
      element.setModel(model);
      return element;
    });
    return elementClass;
  }

  createdCallback() {
    this.classList.add('native-key-bindings');
    this.innerHTML = `
    <div class="install-wrapper">
      <div class="logo">${logo}</div>

      <div class="progress-indicators">
        <div class="download-kite invisible">
          <progress max='100' class="inline-block"></progress>
          <span class="inline-block">Downloading Kite</span>
        </div>
        <div class="install-kite hidden">
          <span class='loading loading-spinner-tiny inline-block'></span>
          <span class="inline-block">Installing Kite</span>
        </div>
        <div class="run-kite hidden">
          <span class='loading loading-spinner-tiny inline-block'></span>
          <span class="inline-block">Starting Kite</span>
        </div>
        <div class="authenticate-user hidden">
          <span class='loading loading-spinner-tiny inline-block'></span>
          <span class="inline-block">Authenticating your account</span>
        </div>
        <div class="install-plugin hidden">
          <span class='loading loading-spinner-tiny inline-block'></span>
          <span class="inline-block">Installing the Kite plugin</span>
        </div>
      </div>

      <div class="content"></div>
    </div>`;

    this.logo = this.querySelector('.logo');
    this.content = this.querySelector('.content');
    this.progress = this.querySelector('progress');
    this.downloadKite = this.querySelector('.download-kite');
    this.installKite = this.querySelector('.install-kite');
    this.runKite = this.querySelector('.run-kite');
    this.authenticateUser = this.querySelector('.authenticate-user');
    this.installPlugin = this.querySelector('.install-plugin');
    this.indicators = this.querySelector('.progress-indicators');
  }

  detachedCallback() {
    this.subscriptions && this.subscriptions.dispose();
    delete this.install;
    delete this.subscriptions;
  }

  setModel(install) {
    this.subscriptions = new CompositeDisposable();
    this.install = install;

    this.subscriptions.add(this.install.onDidChangeCurrentStep(() => {
      this.updateView();
    }));

    this.subscriptions.add(this.install.observeState(state => {
      if (typeof state.kiteLogoVisible !== 'undefined') {
        this.logo.classList.toggle('hidden', !state.kiteLogoVisible);
      }

      if (state.download) {
        if (state.download.done) {
          this.downloadKite.classList.add('hidden');
        } else {
          this.downloadKite.classList.remove('invisible');
        }

        if (state.download.ratio) {
          this.progress.value = Math.round(state.download.ratio * 100);
        }
      }

      if (state.install) {
        this.installKite.classList.toggle('hidden', state.install.done);
      }

      if (state.running) {
        this.runKite.classList.toggle('hidden', state.running.done);
      }

      if (state.authenticate) {
        this.authenticateUser.classList.toggle('hidden', state.authenticate.done);
      }

      if (state.plugin) {
        this.installPlugin.classList.toggle('hidden', state.plugin.done);
      }
    }));

    this.subscriptions.add(this.install.on('encountered-fatal-error', () => {
      this.indicators.classList.add('hidden');
    }));
  }

  getModel() {
    return this.install;
  }

  updateView() {
    if (this.currentView) { this.currentView.release(); }

    const view = this.install.getCurrentStepView();
    if (view) {
      if (this.content.children.length) {
        [].slice.call(this.content.children).forEach(n => this.content.removeChild(n));
      }
      this.content.appendChild(view);
      view.init(this.install);
      this.currentView = view;

      if (this.currentView.name) {
        Metrics.Tracker.trackEvent(`${ this.currentView.name }_shown`,
          this.install.state.error ? {error: this.install.state.error.message} : {});
      }
    }
  }
}

module.exports = InstallElement.initClass();
