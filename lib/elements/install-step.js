const ProgressBar = require('./progress-bar.js');

var InstallStep = class {
  constructor(classes=[]) {
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
    ctaRow.appendChild(this.submitBtn);

    this.progress = new ProgressBar({
      initial: "Installing...",
      finished: "Kite is installed",
    }, ['hidden']);
    ctaRow.appendChild(this.progress.element);

    this.content = document.createElement('div');
    this.element.appendChild(this.content);

    let sepRow = document.createElement('div');
    sepRow.classList.add('row');
    sepRow.classList.add('vertical-align');
    sepRow.classList.add('seperator');
    this.content.appendChild(sepRow);

    let rightSep = document.createElement('div');
    rightSep.classList.add('seperator-border');
    sepRow.appendChild(rightSep);

    let sepText = document.createElement('div');
    sepText.classList.add('seperator-text');
    sepText.textContent = "or";
    sepRow.appendChild(sepText);

    let leftSep = document.createElement('div');
    leftSep.classList.add('seperator-border');
    sepRow.appendChild(leftSep);

    let skipRow = document.createElement('div');
    skipRow.classList.add('row');
    skipRow.classList.add('vertical-align');
    skipRow.classList.add('cta-row');
    this.content.appendChild(skipRow);

    let skipLabel = document.createElement('div');
    skipLabel.classList.add('label');
    skipLabel.textContent = "Autocomplete classic";
    skipRow.appendChild(skipLabel);

    this.skipBtn = document.createElement('button');
    this.skipBtn.classList.add('cta-btn');
    this.skipBtn.classList.add('secondary-cta');
    this.skipBtn.textContent = "Enable Autocomplete Classic";
    skipRow.appendChild(this.skipBtn);

    let skipDescription = document.createElement('div');
    let skipParagraph = document.createElement('p');
    skipParagraph.textContent =
      "This is the legacy engine which powers autocomplete-python. " +
      "It uses RAM and also provides less completions than Kite.";
    skipDescription.appendChild(skipParagraph);
    this.content.appendChild(skipDescription);
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
    this.content.classList.add('hidden');
    this.progress.show();
  }

  onSubmit(func) {
    this.submitBtn.onclick = func;
  }

  onSkip(func) {
    this.skipBtn.onclick = func;
  }
};

module.exports = InstallStep;
