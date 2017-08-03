'use strict';

class InstallErrorElement extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-atom-install-error', {
      prototype: this.prototype,
    });
  }

  createdCallback() {}

  init(install) {
    this.innerHTML = `
    <div class="status">
      <h4>${install.state.error.message}</h4>
      <pre>${install.state.error.stack}</pre>
    </div>
    `;
  }

  release() {}
}

module.exports = InstallErrorElement.initClass();
