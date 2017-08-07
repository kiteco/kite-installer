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
    this.innerHTML = `
    <p class="hidden email"></p>
    <p>
      Kite is a cloud-powered programming tool.
      Where enabled, your code is sent to our cloud,
      where it is kept private and secure.
    </p>
    <p>
      This lets Kite show completions, documentation, examples and more.
    </p>
    <p>
      You can restrict access to individual files or entire directories
      at any time. You can also remove unwanted data from the cloud freely.
      <a href="http://help.kite.com/category/30-security-privacy">Click here to learn more</a>
    </p>

    <div class="actions">
      <button class="btn btn-primary">Enable access</button>
      <a class="skip secondary-cta">Add Later</a>
    </div>`;

    this.emailParagraph = this.querySelector('.email');
    this.whitelistButton = this.querySelector('button');
    this.skipWhitelistButton = this.querySelector('a.skip');
  }

  release() {
    this.subscriptions && this.subscriptions.dispose();
    delete this.install;
    delete this.subscriptions;
  }

  init(install) {
    this.subscriptions = new CompositeDisposable();
    this.install = install;
    this.classList.remove('disabled');

    this.whitelistButton.textContent = `Enable access for ${install.state.path}`;

    this.subscriptions.add(addDisposableEventListener(this.whitelistButton, 'click', () => {
      this.classList.add('disabled');
      this.install.emit('did-whitelist');
    }));

    this.subscriptions.add(addDisposableEventListener(this.skipWhitelistButton, 'click', () => {
      this.classList.add('disabled');
      this.install.emit('did-skip-whitelist');
    }));

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
