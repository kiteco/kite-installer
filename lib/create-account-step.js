var CreateAccountStep = class {
  constructor(listeners, classes=[]) {
    this.element = document.createElement('div');
    this.element.classList.add('create-account-step');
    this.element.classList.add('native-key-bindings');
    classes.forEach((c) => this.element.classList.add(c));

    let copy = document.createElement('div');
    let paragraph = document.createElement('p');
    paragraph.textContent =
      "Great! While Kite is installing, sign in with your email address.";
    copy.appendChild(paragraph);
    this.element.appendChild(copy);

    this.email = document.createElement('input');
    this.email.type = 'email';
    this.email.name = 'email';
    this.email.placeholder = 'Email';
    this.element.appendChild(this.email);

    this.submitBtn = document.createElement('button');
    this.submitBtn.classList.add('cta-btn');
    this.submitBtn.textContent = "Continue";
    this.submitBtn.onclick = listeners.submit;
    this.element.appendChild(this.submitBtn);

    this.error = document.createElement('div');
    this.error.classList.add('error');
    this.error.classList.add('hidden');
    this.element.appendChild(this.error);
  }

  destroy() {
    this.element.remove();
  }

  hide() {
    this.element.classList.add('hidden');
  }

  show() {
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
    return { email: this.email.value };
  }
};

module.exports = CreateAccountStep;
