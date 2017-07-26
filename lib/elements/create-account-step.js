'use strict';

var utils = require('../utils.js');

var CreateAccountStep = class {
  constructor(classes) {
    classes = classes || [];
    this.element = document.createElement('div');
    this.element.classList.add('create-account-step');
    classes.forEach((c) => this.element.classList.add(c));

    let copy = document.createElement('div');
    let paragraph = document.createElement('p');
    paragraph.textContent =
      'Great! While Kite is installing, create an account with your email address.';
    copy.appendChild(paragraph);
    this.element.appendChild(copy);

    this.email = document.createElement('input');
    this.email.type = 'text';
    this.email.name = 'email';
    this.email.placeholder = 'Email';
    this.email.tabIndex = 1;
    this.element.appendChild(this.email);

    this.submitBtn = document.createElement('button');
    this.submitBtn.classList.add('cta-btn');
    this.submitBtn.textContent = 'Continue';
    this.element.appendChild(this.submitBtn);

    utils.bindEnterToClick(this.email, this.submitBtn);

    this.status = document.createElement('div');
    this.status.classList.add('status');
    this.status.classList.add('hidden');
    this.element.appendChild(this.status);
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

  get data() {
    return { email: this.email.value };
  }
};

module.exports = CreateAccountStep;
