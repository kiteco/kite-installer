'use strict';

var ProgressBar = require('./progress-bar.js');

var InstallStep = class {
  constructor(classes) {
    classes = classes || [];
    this.element = document.createElement('div');
    this.element.classList.add('install-step');
    classes.forEach((c) => this.element.classList.add(c));

    this.kiteSection = document.createElement('div');
    this.kiteSection.classList.add('section');
    this.kiteSection.classList.add('highlighted-section');

    this.element.appendChild(this.kiteSection);

    let ctaRow = document.createElement('div');
    ctaRow.classList.add('kite');
    ctaRow.classList.add('row');
    ctaRow.classList.add('vertical-align');
    ctaRow.classList.add('cta-row');
    this.kiteSection.appendChild(ctaRow);

    let logo = document.createElement('div');
    logo.classList.add('kite');
    logo.classList.add('inline');
    logo.classList.add('logo');
    logo.textContent = 'Kite';
    ctaRow.appendChild(logo);

    var separator = document.createElement('div');
    separator.classList.add('separator');
    ctaRow.appendChild(separator);

    this.submitBtn = document.createElement('button');
    this.submitBtn.classList.add('cta-btn');
    this.submitBtn.classList.add('top');
    this.submitBtn.textContent = 'Enable Kite';
    ctaRow.appendChild(this.submitBtn);

    this.loader = document.createElement('span');
    this.loader.classList.add('loading');
    this.loader.classList.add('loading-spinner-small');
    this.loader.classList.add('inline-block');
    this.loader.classList.add('hidden');
    ctaRow.appendChild(this.loader);

    this.progress = new ProgressBar({
      initial: 'Kite is installing...',
      finished: 'Kite is installed',
    }, ['hidden']);
    ctaRow.appendChild(this.progress.element);

    this.content = document.createElement('div');

    this.kiteDescription = document.createElement('div');
    this.kiteDescription.innerHTML = `
    <div data-install-copy="long">
      <p><strong>Cloud powered completions</strong></p>
      <ul>
        <li>More accurate, with 1.5x as many completions, generated from all the open-source code on Github.</li>
        <li>Shows the best completions first with algorithmic ranking based on real-world code usage.</li>
        <li>Twice the documentation coverage, with better formatting.</li>
      </ul>
      <p>Kite also includes a sidebar app you can use to get more information, code examples, and search.</p>
      <p>
        All this is possible because Kite analyzes your code in the cloud.
        <a href="http://kite.com/faq-autocomplete-python">Click here to learn more</a>.</p>
    </div>
    <div data-install-copy="short">
      <p><strong>Cloud powered completions</strong></p>
      <p>
        1.5x as many completions and 2x documentation coverage,
        powered by all the open-source code on Github.
        Kite achieves this by analyzing your code in the cloud,
        alongside a native app that offers more information, code examples,
        and search.
        <a href="http://kite.com/faq-autocomplete-python">Click here to learn more</a>.</p>
    </div>
    <div class="screenshot"></div>
    `;

    this.submitBtnB = document.createElement('button');
    this.submitBtnB.classList.add('cta-btn');
    this.submitBtnB.classList.add('bottom');
    this.submitBtnB.classList.add('redshit');
    this.submitBtnB.classList.add('centered');
    this.submitBtnB.textContent = 'Enable Kite';
    this.kiteDescription.appendChild(this.submitBtnB);

    this.kiteSection.appendChild(this.kiteDescription);

    this.element.appendChild(this.content);

    let sepRow = document.createElement('div');
    sepRow.classList.add('kite');
    sepRow.classList.add('row');
    sepRow.classList.add('vertical-align');
    sepRow.classList.add('separator');
    this.content.appendChild(sepRow);

    let rightSep = document.createElement('div');
    rightSep.classList.add('separator-border');
    sepRow.appendChild(rightSep);

    let sepText = document.createElement('div');
    sepText.classList.add('separator-text');
    sepText.textContent = 'or';
    sepRow.appendChild(sepText);

    let leftSep = document.createElement('div');
    leftSep.classList.add('separator-border');
    sepRow.appendChild(leftSep);

    let classicSection = document.createElement('div');
    classicSection.classList.add('section');
    this.content.appendChild(classicSection);

    let skipRow = document.createElement('div');
    skipRow.classList.add('kite');
    skipRow.classList.add('row');
    skipRow.classList.add('vertical-align');
    skipRow.classList.add('cta-row');
    classicSection.appendChild(skipRow);

    let skipLabel = document.createElement('div');
    skipLabel.classList.add('label');
    skipLabel.textContent = 'Local engine';
    skipRow.appendChild(skipLabel);

    this.skipBtn = document.createElement('button');
    this.skipBtn.classList.add('cta-btn');
    this.skipBtn.classList.add('top');
    this.skipBtn.classList.add('secondary-cta');
    this.skipBtn.textContent = 'Enable local engine';
    skipRow.appendChild(this.skipBtn);

    let skipDescription = document.createElement('div');
    let skipParagraph = document.createElement('p');
    skipParagraph.textContent =
      'Use local code analysis engine (lower accuracy, less complete).';
    skipDescription.appendChild(skipParagraph);
    this.skipBtnB = document.createElement('button');
    this.skipBtnB.classList.add('cta-btn');
    this.skipBtnB.classList.add('bottom');
    this.skipBtnB.classList.add('centered');
    this.skipBtnB.classList.add('secondary-cta');
    this.skipBtnB.textContent = 'Enable local engine';
    skipDescription.appendChild(this.skipBtnB);
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
    this.submitBtnB.classList.add('hidden');
    this.content.classList.add('hidden');
    this.kiteDescription.classList.add('hidden');
    this.kiteSection.classList.remove('highlighted-section');
    this.loader.classList.remove('hidden');
    this.progress.show();
  }

  onSubmit(func) {
    this.submitBtn.onclick = func;
    this.submitBtnB.onclick = func;
  }

  onSkip(func) {
    this.skipBtn.onclick = func;
    this.skipBtnB.onclick = func;
  }
};

module.exports = InstallStep;
