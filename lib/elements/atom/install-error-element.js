'use strict';

class InstallErrorElement extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-install-error', {
      prototype: this.prototype,
    });
  }

  createdCallback() {
    this.innerHTML = `

    `;
  }
}

module.exports = InstallErrorElement.initClass();
