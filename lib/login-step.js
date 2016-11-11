const utils = require('./utils.js');

var LoginStep = class {
  constructor(listeners, classes=[]) {
    this.element = document.createElement('div');
    this.element.classList.add('login-step');
    this.element.classList.add('native-key-bindings');
    classes.forEach((c) => this.element.classList.add(c));

    let copy = document.createElement('div');
    let paragraph = document.createElement('p');
    paragraph.textContent =
      "It seems like you already have a Kite account. " +
      "Sign in with your login info.";
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

    utils.bindEnterToClick(this.email, this.submitBtn);
    utils.bindEnterToClick(this.password, this.submitBtn);

    this.error = document.createElement('div');
    this.error.classList.add('error');
    this.error.classList.add('hidden');
    this.element.appendChild(this.error);

    this.submitBtn = document.createElement('button');
    this.submitBtn.classList.add('cta-btn');
    this.submitBtn.textContent = "Sign in";
    this.submitBtn.onclick = listeners.submit;
    this.element.appendChild(this.submitBtn);
  }

  destroy() {
    this.element.remove();
  }

  hide() {
    this.element.classList.add('hidden');
  }

  show() {
    this.email.focus();
    this.email.setSelectionRange(0, this.email.value.length);
    this.element.classList.remove('hidden');
  }

  setEmail(email) {
    this.email.value = email;
  }

  showError(text) {
    this.error.textContent = text;
    this.error.classList.remove('hidden');
  }

  hideError() {
    this.error.textContent = "";
    this.error.classList.add('hidden');
  }

  onSubmit(func) {
    this.submitBtn.onclick = func;
  }

  get data() {
    return {
      email: this.email.value,
      password: this.password.value,
    };
  }
};

module.exports = LoginStep;
