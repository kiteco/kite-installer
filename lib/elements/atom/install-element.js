'use strict';

// const {Emitter, CompositeDisposable} = require('atom');
// const {addDisposableEventListener} = require('../../atom-helper');
const Install = require('../../install');
const path = require('path');

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
      <div class="content"></div>
    `;

    this.content = this.querySelector('.content');
  }

  detachedCallback() {
    this.subscription && this.subscription.dispose();
    delete this.install;
    delete this.subscription;
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
    const view = this.install.getCurrentStepView();
    if (view) {
      if (this.content.children.length) {
        [].slice.call(this.content.children).forEach(n => this.content.removeChild(n));
      }
      this.content.appendChild(view);
      view.setInstall(this.install);
    }
  }
}

module.exports = InstallElement.initClass();
