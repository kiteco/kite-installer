'use strict';

class InstallErrorElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
  }

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

customElements.define('kite-atom-install-error', InstallErrorElement);

module.exports = InstallErrorElement;
