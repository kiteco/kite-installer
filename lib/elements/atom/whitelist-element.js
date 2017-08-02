'use strict';

const {CompositeDisposable} = require('atom');
const {addDisposableEventListener} = require('../../atom-helper');

class WhitelistElement extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-atom-whitelist', {
      prototype: this.prototype,
    });
  }

  get data() { return {email: this.input.value}; }

  createdCallback() {
    this.subscriptions = new CompositeDisposable();

    this.innerHTML = `
    <p class="hidden email"></p>
    <p>Kite is a cloud-powered programming tool.
    Where enabled, your code is sent to our cloud,
    where it is kept private and secure.</p>
    <p>This lets Kite show completions, documentation, examples and more.</p>
    <p class="hidden end"></p>

    <div class="actions">
      <button class="btn btn-primary">Enable access</button>
      <a class="skip">Add Later</button>
    </div>
    `;

    this.emailParagraph = this.querySelector('.email');
    this.whitelistButton = this.querySelector('button');
    this.skipWhitelistButton = this.querySelector('a.skip');

    this.subscriptions.add(addDisposableEventListener(this.whitelistButton, 'click', () => {
      this.install.emit('did-whitelist');
    }));

    this.subscriptions.add(addDisposableEventListener(this.skipWhitelistButton, 'click', () => {
      this.install.emit('did-skip-whitelist');
    }));
  }

  detachedCallback() {
    this.subscriptions && this.subscriptions.dispose();
    delete this.install;
    delete this.subscriptions;
  }

  setInstall(install) {
    this.install = install;
    this.subscriptions.add(install.observeState(state => this.onStateChange(state)));
  }

  onStateChange(state) {
    this.emailParagraph.textContent = `
      Great we've sent you an email to ${state.account.email}.
      Remember to set your password later!`;
    this.emailParagraph.classList.remove('hidden');
  }
}

module.exports = WhitelistElement.initClass();
