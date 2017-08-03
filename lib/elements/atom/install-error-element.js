'use strict';

class InstallErrorElement extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-atom-install-error', {
      prototype: this.prototype,
    });
  }

  createdCallback() {
    this.innerHTML = `

    `;
  }

  init() {}

  release() {}
}

module.exports = InstallErrorElement.initClass();
