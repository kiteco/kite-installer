'use strict';

// const {Emitter, CompositeDisposable} = require('atom');
// const {addDisposableEventListener} = require('../../atom-helper');
const Install = require('../../install');

class InstallElement extends HTMLElement {
  static initClass() {
    const elementClass = document.registerElement('kite-atom-install', {
      prototype: this.prototype,
    });
    atom.views.addViewProvider(Install, model => {
      const element = new elementClass();
      element.setModel(model);
      return element;
    });
    return elementClass;
  }

  createdCallback() {
    this.classList.add('native-key-bindings');
  }

  setModel(install) {
    this.install = install;

    this.subscription = this.install.onDidChangeCurrentStep(() => {
      this.updateView();
    });
  }

  getModel() {
    return this.install;
  }

  updateView() {
    if (this.install.currentStep && this.install.currentStep.view) {
      if (this.children.length) {
        [].slice.call(this.children).forEach(n => this.removeChild(n));
      }
      this.appendChild(this.install.currentStep.view);
      this.install.currentStep.view.setInstall(this.install);
    }
  }
}

module.exports = InstallElement.initClass();
