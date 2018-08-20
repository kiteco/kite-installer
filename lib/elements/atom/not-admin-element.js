'use strict';

const {CompositeDisposable} = require('atom');
const {addDisposableEventListener} = require('../../atom-helper');

class NotAdminElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
    this.innerHTML = `
    <div class="content">
      <p>It seems like you don't have administrator privileges. Please restart Atom as an administrator and try installing Kite again.</p>
      <p>You can also <a class="download-link" href="https://kite.com/download">manually install Kite</a>.</p>
      <p class="dismiss"><a class="dismiss-link" href="#">Don't show this again</a></p>
    </div>
    `;

    this.dismissButton = this.querySelector('.dismiss-link');
  }

  init(install) {
    this.install = install;
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(addDisposableEventListener(this.dismissButton, 'click', () => {
      this.install.destroy();
      this.install.emit('not-admin-dismissed');
    }));

    this.install.emit('not-admin-shown');
  }

  release() {}
}

customElements.define('kite-atom-install-not-admin', NotAdminElement);

module.exports = NotAdminElement;
