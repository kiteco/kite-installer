'use strict';

class NotAdminElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
  }

  init(install) {
    this.innerHTML = `
    <div class="content">
      <p>You must have administrator privileges to install Kite.</p>
      <p>You can download Kite at this address: <a href="https://kite.com/download">kite.com/download</a></p>
    </div>
    <br>
    `;
  }

  release() {}
}

customElements.define('kite-atom-install-not-admin', NotAdminElement);

module.exports = NotAdminElement;
