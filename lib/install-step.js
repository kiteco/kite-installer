const ProgressBar = require('./progress-bar.js');

var InstallStep = class {
  constructor(listeners, statuses, classes=[]) {
    this.element = document.createElement('div');
    this.element.classList.add('install-step');
    this.element.classList.add('native-key-bindings');
    classes.forEach((c) => this.element.classList.add(c));

    let ctaRow = document.createElement('div');
    ctaRow.classList.add('row');
    ctaRow.classList.add('vertical-align');
    ctaRow.classList.add('cta-row');
    this.element.appendChild(ctaRow);

    let logo = document.createElement('div');
    logo.classList.add('inline');
    logo.classList.add('logo');
    ctaRow.appendChild(logo);

    this.submitBtn = document.createElement('button');
    this.submitBtn.classList.add('cta-btn');
    this.submitBtn.textContent = "Enable Kite";
    this.submitBtn.onclick = listeners.submit;
    ctaRow.appendChild(this.submitBtn);

    this.progress = new ProgressBar(statuses, ['hidden']);
    ctaRow.appendChild(this.progress.element);
  }

  destroy() {
    this.progress.destroy();
    this.element.remove();
  }

  hide() {
    this.element.classList.add('hidden');
  }

  show() {
    this.element.classList.remove('hidden');
  }

  showProgress() {
    this.submitBtn.classList.add('hidden');
    this.progress.show();
  }

  onSubmit(func) {
    this.submitBtn.onclick = func;
  }
};

module.exports = InstallStep;
