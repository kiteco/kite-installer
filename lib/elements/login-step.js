'use strict';

var utils = require('../utils.js');

var LoginStep = class {
  constructor(classes) {
    classes = classes || [];
    this.element = document.createElement('div');
    this.element.classList.add('login-step');
    classes.forEach((c) => this.element.classList.add(c));

    let copy = document.createElement('div');
    let paragraph = document.createElement('p');
    paragraph.textContent =
      'It seems like you already have a Kite account. ' +
      'Sign in with your login info.';
    copy.appendChild(paragraph);
    this.element.appendChild(copy);

    this.email = document.createElement('input');
    this.email.type = 'text';
    this.email.name = 'email';
    this.email.placeholder = 'Email';
    this.email.tabIndex = 1;
    this.element.appendChild(this.email);

    this.password = document.createElement('input');
    this.password.type = 'password';
    this.password.name = 'password';
    this.password.placeholder = 'Password';
    this.password.tabIndex = 2;
    this.element.appendChild(this.password);

    this.submitBtn = document.createElement('button');
    this.submitBtn.classList.add('cta-btn');
    this.submitBtn.textContent = 'Sign in';
    this.element.appendChild(this.submitBtn);

    utils.bindEnterToClick(this.email, this.submitBtn);
    utils.bindEnterToClick(this.password, this.submitBtn);

    this.status = document.createElement('div');
    this.status.classList.add('status');
    this.status.classList.add('hidden');
    this.element.appendChild(this.status);

    let links = document.createElement('div');
    links.classList.add('secondary-cta-section');
    this.element.appendChild(links);

    this.backLink = document.createElement('a');
    this.backLink.textContent = 'Back';
    links.appendChild(this.backLink);

    this.resetLink = document.createElement('a');
    this.resetLink.textContent = 'Forgot password';
    links.appendChild(this.resetLink);
  }

  destroy() {
    this.element.remove();
  }

  hide() {
    this.hideStatus();
    this.element.classList.add('hidden');
  }

  show() {
    this.element.classList.remove('hidden');
    this.email.focus();
    this.email.setSelectionRange(0, this.email.value.length);
  }

  setEmail(email) {
    this.email.value = email;
  }

  showStatus(text) {
    this.status.textContent = text;
    this.status.classList.remove('error');
    this.status.classList.remove('hidden');
  }

  hideStatus() {
    this.status.textContent = '';
    this.status.classList.remove('error');
    this.status.classList.add('hidden');
  }

  showError(text) {
    this.status.textContent = text;
    this.status.classList.add('error');
    this.status.classList.remove('hidden');
  }

  hideError() {
    this.hideStatus();
  }

  onSubmit(func) {
    this.submitBtn.onclick = func;
  }

  onBack(func) {
    this.backLink.onclick = func;
  }

  onReset(func) {
    this.resetLink.onclick = func;
  }

  get data() {
    return {
      email: this.email.value,
      password: this.password.value,
    };
  }
};

module.exports = LoginStep;
