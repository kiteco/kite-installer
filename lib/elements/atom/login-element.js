'use strict';

const {CompositeDisposable} = require('atom');
const {addDisposableEventListener} = require('../../atom-helper');

class LoginElement extends HTMLElement {
  static initClass() {
    return document.registerElement('kite-atom-login', {
      prototype: this.prototype,
    });
  }

  get data() {
    return {email: this.input.value, password: this.password.value};
  }

  createdCallback() {
    this.subscriptions = new CompositeDisposable();

    this.innerHTML = `
    <form>
      <input name="email" type="email" required></input>
      <input name="password" type="password" required></input>
      <a>Forgot password</a>
      <button class="btn btn-primary btn-block" type="submit">Sign in</button>
      <div class="status hidden"></div>
    </form>
    `;

    this.form = this.querySelector('form');
    this.input = this.querySelector('input[type="email"]');
    this.password = this.querySelector('input[type="password"]');
    this.submit = this.querySelector('button[type="submit"]');
    this.forgotPassword = this.querySelector('a');
    this.status = this.querySelector('.status');

    this.subscriptions.add(addDisposableEventListener(this.form, 'submit', () => {
      this.install.emit('did-submit-credentials', this.data);
    }));

    this.subscriptions.add(addDisposableEventListener(this.forgotPassword, 'click', () => {
      this.install.emit('did-forgot-password');
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
    this.input.value = state.account.email || '';
    this.input.password = state.account.password || '';
    if (state.error) {
      this.status.textContent = state.error;
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

module.exports = LoginElement.initClass();
