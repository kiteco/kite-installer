var ProgressBar = require('./progress-bar.js');

var InstallStep = class {
  constructor(classes=[]) {
    this.element = document.createElement('div');
    this.element.classList.add('install-step');
    this.element.classList.add('native-key-bindings');
    classes.forEach((c) => this.element.classList.add(c));

    this.kiteSection = document.createElement('div');
    this.kiteSection.classList.add('section');
    this.kiteSection.classList.add('highlighted-section');

    this.element.appendChild(this.kiteSection);

    let ctaRow = document.createElement('div');
    ctaRow.classList.add('row');
    ctaRow.classList.add('vertical-align');
    ctaRow.classList.add('cta-row');
    this.kiteSection.appendChild(ctaRow);

    let logo = document.createElement('div');
    logo.classList.add('inline');
    logo.classList.add('logo');
    ctaRow.appendChild(logo);

    this.submitBtn = document.createElement('button');
    this.submitBtn.classList.add('cta-btn');
    this.submitBtn.textContent = "Enable Kite";
    ctaRow.appendChild(this.submitBtn);

    this.progress = new ProgressBar({
      initial: "Kite is installing...",
      finished: "Kite is installed",
    }, ['hidden']);
    ctaRow.appendChild(this.progress.element);

    this.content = document.createElement('div');

    this.kiteDescription = document.createElement('div');
    this.kiteDescription.innerHTML = '\
    <div data-installCopy="long"> \
      <p><strong>Cloud powered completions</strong></p> \
      <ul> \
        <li>More accurate, with 1.5x as many completions, generated from all the open-source code on Github.</li> \
        <li>Shows the best completions first with algorithmic ranking based on real-world code usage.</li> \
        <li>Twice the documentation coverage, with better HTML formatting.</li> \
      </ul> \
      <p>Kite also includes a sidebar app you can use to get more information, code examples, and search.</p> \
      <p>All this is possible because Kite analyzes your code in the cloud.  Click here to learn more.</p> \
    </div> \
    <div data-installCopy="short"> \
      <p><strong>Cloud powered completions</strong></p> \
      <p>1.5x as many completions and 2x documentation coverage, powered by all the open-source code on Github.  Kite achieves this by analyzing your code in the cloud.  Click here to learn more.</p> \
    </div> \
    ';
    this.kiteSection.appendChild(this.kiteDescription);

    this.element.appendChild(this.content);

    let sepRow = document.createElement('div');
    sepRow.classList.add('row');
    sepRow.classList.add('vertical-align');
    sepRow.classList.add('separator');
    this.content.appendChild(sepRow);

    let rightSep = document.createElement('div');
    rightSep.classList.add('separator-border');
    sepRow.appendChild(rightSep);

    let sepText = document.createElement('div');
    sepText.classList.add('separator-text');
    sepText.textContent = "or";
    sepRow.appendChild(sepText);

    let leftSep = document.createElement('div');
    leftSep.classList.add('separator-border');
    sepRow.appendChild(leftSep);

    let classicSection = document.createElement('div');
    classicSection.classList.add('section');
    this.content.appendChild(classicSection);

    let skipRow = document.createElement('div');
    skipRow.classList.add('row');
    skipRow.classList.add('vertical-align');
    skipRow.classList.add('cta-row');
    classicSection.appendChild(skipRow);

    let skipLabel = document.createElement('div');
    skipLabel.classList.add('label');
    skipLabel.textContent = "Local engine";
    skipRow.appendChild(skipLabel);

    this.skipBtn = document.createElement('button');
    this.skipBtn.classList.add('cta-btn');
    this.skipBtn.classList.add('secondary-cta');
    this.skipBtn.textContent = "Enable local engine";
    skipRow.appendChild(this.skipBtn);

    let skipDescription = document.createElement('div');
    let skipParagraph = document.createElement('p');
    skipParagraph.textContent =
      "Use local code analysis engine (lower accuracy, less complete).";
    skipDescription.appendChild(skipParagraph);
    classicSection.appendChild(skipDescription);
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
    this.kiteDescription.classList.add('hidden');
    this.kiteSection.classList.remove('highlighted-section');
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
