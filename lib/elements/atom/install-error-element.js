'use strict';

class InstallErrorElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
  }

  init(install) {
    this.install = install;
    this.install.emit('encountered-fatal-error');
    this.innerHTML = `
    <div class="content">
      <p>
        We've encountered an error!
        Please email <a href="mailto:feedback@kite.com">feedback@kite.com</a>
        with the contents of the error message below to get help.
      </p>
    </div>
    <br>
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
