'use strict';

const {Emitter, CompositeDisposable} = require('atom');
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
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(this.emitter);

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
      this.emitter.emit('did-submit');
    }));

    this.subscriptions.add(addDisposableEventListener(this.forgotPassword, 'click', () => {
      this.emitter.emit('did-forgot-password');
    }));
  }

  detachedCallback() {
    this.subscriptions && this.subscriptions.dispose();
  }

  onDidSubmit(listener) {
    this.emitter.on('did-submit', listener);
  }

  onDidNavigateBack(listener) {
    this.emitter.on('did-navigate-back', listener);
  }

  onDidForgotPassword(listener) {
    this.emitter.on('did-forgot-password', listener);
  }

  setInstall(install) {
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
