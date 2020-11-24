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
      </p>
    </div>
    <br>
    <div class="status">
      <h4>${install.state.error.message}</h4>
      <pre>${install.state.error.stack}</pre>
    </div>
    <br>
    <p>
      You can try fixing this yourself by
      <a href="https://kite.com/download">manually downloading and installing
      Kite</a>.
    </p>
    `;
  }

  release() {}
}

customElements.define('kite-atom-install-error', InstallErrorElement);

module.exports = InstallErrorElement;
