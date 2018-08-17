'use strict';

class NotAdminElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
    this.innerHTML = `
    <div class="content">
      <p>It seems like you don't have administrator privileges. Please restart Atom as an administrator and try installing Kite again.</p>
      <p>You can also <a class="download-link" href="https://kite.com/download">manually install Kite</a>.</p>
    </div>
    <br>
    `;
  }

  init(install) {
    this.install = install;
    this.install.emit('not-admin-shown');
  }

  release() {}
}

customElements.define('kite-atom-install-not-admin', NotAdminElement);

module.exports = NotAdminElement;
