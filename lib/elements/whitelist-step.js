'use strict';

var WhitelistStep = class {
  constructor(classes) {
    classes = classes || [];
    this.element = document.createElement('div');
    this.element.classList.add('whitelist-step');
    classes.forEach((c) => this.element.classList.add(c));

    this.copy = document.createElement('div');
    this.emailParagraph = document.createElement('p');
    this.emailParagraph.classList.add('hidden');
    let p2 = document.createElement('p');
    p2.classList.add('strong');
    p2.textContent =
      'Kite is a cloud-powered programming tool. ' +
      'Where enabled, your code is sent to our cloud, ' +
      'where it is kept private and secure.';
    let p3 = document.createElement('p');
    p3.textContent =
      'This lets Kite show completions, documentation, examples ' +
      'and more.';
    let p4 = document.createElement('p');
    p4.classList.add('ending-paragraph');
    p4.textContent =
      'You can restrict access to individual files or entire directories ' +
      'at any time. You can also remove unwanted data from the cloud freely. ';
    let faqlink = document.createElement('a');
    faqlink.href = 'http://help.kite.com/category/30-security-privacy';
    faqlink.textContent = 'Click here to learn more';
    p4.appendChild(faqlink);
    this.copy.appendChild(this.emailParagraph);
    this.copy.appendChild(p2);
    this.copy.appendChild(p3);
    this.copy.appendChild(p4);
    this.element.appendChild(this.copy);

    this.finished = document.createElement('p');
    this.finished.classList.add('hidden');
    this.element.appendChild(this.finished);

    this.submitBtn = document.createElement('button');
    this.submitBtn.classList.add('cta-btn');
    this.submitBtn.textContent = 'Enable access';
    this.element.appendChild(this.submitBtn);

    this.links = document.createElement('div');
    this.links.classList.add('secondary-cta-section');
    this.element.appendChild(this.links);

    this.skipLink = document.createElement('a');
    this.skipLink.textContent = 'Add Later';
    this.links.appendChild(this.skipLink);
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
    if (email) {
      this.emailParagraph.textContent =
        "Great we've sent you an email to " + email + '. ' +
        'Remember to set your password later!';
      this.emailParagraph.classList.remove('hidden');
    }
  }

  setPath(path) {
    if (path) {
      this.submitBtn.textContent = 'Enable access in ' + path;
    }
  }

  setFinished(text) {
    this.copy.classList.add('hidden');
    this.submitBtn.classList.add('hidden');
    this.links.classList.add('hidden');
    this.finished.textContent = text;
    this.finished.classList.remove('hidden');
  }

  onSubmit(func) {
    this.submitBtn.onclick = func;
  }

  onSkip(func) {
    this.skipLink.onclick = func;
  }
};

module.exports = WhitelistStep;
