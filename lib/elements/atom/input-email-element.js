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
      <input class="input-text" name="email" type="email"></input>
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
    this.input = this.querySelector('input');
    this.submit = this.querySelector('button');
    this.status = this.querySelector('.status');
    this.skipButton = this.querySelector('a.skip-email');
  }

  get data() { return {email: this.input.value}; }

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
      this.install.emit('did-skip-email', {skipped: true});
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
