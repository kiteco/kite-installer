'use strict';

const {CompositeDisposable} = require('atom');
const {addDisposableEventListener} = require('../../atom-helper');

class InputEmailElement extends HTMLElement {
  constructor(name) {
    super();
    this.name = name;
    this.innerHTML = `
    <div>
      <p>Great! Create an account with your email address.</p>
    </div>
    <form novalidate>
      <input class="input-text input-email" name="email" type="email">
      <label class="label-install-plugins" for="input-install-plugins"> 
        <input class="input-install-plugins" type="checkbox" name="install-plugins" checked="checked" id="input-install-plugins">
        <span>Install Kite for all supported editors</span>
      </label>
      <button class="btn btn-primary btn-block">Continue</button>
      <div class="status hidden"></div>
    </form>
    <center>
      <div class="dismiss secondary-actions">
        <a class="skip-email">Continue without email</a>
      </div>
    </center>

    `;
    this.form = this.querySelector('form');
    this.input = this.querySelector('.input-email');
    this.installPlugins = this.querySelector('.input-install-plugins');
    this.submit = this.querySelector('button');
    this.status = this.querySelector('.status');
    this.skipButton = this.querySelector('a.skip-email');
  }

  get data() {
    return {
      account: {
        email: this.input.value,
      },
      installPlugins: this.installPlugins.value === 'on'
    };
  }

  get dataSkip() {
    return {
      skipped: true,
      installPlugins: this.installPlugins.value === 'on'
    };
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

    this.subscriptions.add(install.observeState(state => this.onStateChange(state)));

    this.subscriptions.add(addDisposableEventListener(this.form, 'submit', () => {
      this.hideError();
      this.classList.add('disabled');
      this.install.emit('did-submit-email', this.data);
    }));

    this.subscriptions.add(addDisposableEventListener(this.skipButton, 'click', () => {
      this.install.emit('did-skip-email', this.dataSkip);
    }));
  }

  onStateChange(state) {
    this.input.value = state.account.email || '';
    if (state.error) {
      console.log(state.error);
      this.status.textContent = state.error.message;
      this.status.classList.remove('hidden');
    } else {
      this.hideError();
    }
  }

  hideError() {
    this.status.textContent = '';
    this.status.classList.add('hidden');
  }
}

customElements.define('kite-atom-input-email', InputEmailElement);

module.exports = InputEmailElement;
