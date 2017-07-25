'use strict';

var ProgressBar = require('./progress-bar.js');

var InstallStep = class {
  constructor(classes) {
    classes = classes || [];
    this.element = document.createElement('div');
    this.element.classList.add('install-step');
    classes.forEach((c) => this.element.classList.add(c));

    // Kite
    this.kiteSection = document.createElement('div');
    this.kiteSection.classList.add('section');
    this.kiteSection.classList.add('highlighted-section');

    this.element.appendChild(this.kiteSection);

    let kiteTitleRow = document.createElement('div');
    kiteTitleRow.classList.add('row');
    kiteTitleRow.classList.add('vertical-align');
    kiteTitleRow.classList.add('title-row');
    this.kiteSection.appendChild(kiteTitleRow);

    let kiteLogo = document.createElement('div');
    kiteLogo.classList.add('inline');
    kiteLogo.classList.add('logo');
    kiteLogo.classList.add('kite');
    kiteLogo.textContent = 'Kite';
    kiteTitleRow.appendChild(kiteLogo);

    let kiteFeatures = document.createElement('div');
    kiteFeatures.classList.add('features');
    kiteFeatures.appendChild(createFeature('Ranked keyword and function completions'));
    kiteFeatures.appendChild(createFeature('1.5x more completions'));
    kiteFeatures.appendChild(createFeature('Docs and examples from StackOverflow and GitHub'));
    kiteFeatures.appendChild(createFeature('Go-to definitions, usages and search'));
    this.kiteSection.appendChild(kiteFeatures);

    let kiteSeparator = document.createElement('div');
    kiteSeparator.classList.add('separator');
    this.kiteSection.appendChild(kiteSeparator);

    let kiteLocalities = document.createElement('div');
    kiteLocalities.classList.add('localities');
    kiteLocalities.appendChild(createLocality('Kite comes with a native app that syncs your code to the cloud, where it is analyzed to give you better results.', 'icon-cloud-upload', 'https://kite.com/blog/faq-autocomplete-python'));
    this.kiteSection.appendChild(kiteLocalities);

    let kiteCtaRow = document.createElement('center');
    kiteCtaRow.classList.add('cta-row');
    this.kiteSection.appendChild(kiteCtaRow)
    this.submitBtn = document.createElement('button');
    this.submitBtn.classList.add('cta-btn');
    this.submitBtn.textContent = 'Install and signup';
    kiteCtaRow.appendChild(this.submitBtn);

    // Jedi
    this.jediSection = document.createElement('div');
    this.jediSection.classList.add('section');
    this.jediSection.classList.add('highlighted-section');

    this.element.appendChild(this.jediSection);

    let jediTitleRow = document.createElement('div');
    jediTitleRow.classList.add('row');
    jediTitleRow.classList.add('vertical-align');
    jediTitleRow.classList.add('title-row');
    this.jediSection.appendChild(jediTitleRow);

    let jediLogo = document.createElement('div');
    jediLogo.classList.add('inline');
    jediLogo.classList.add('logo');
    jediLogo.textContent = 'Jedi';
    jediTitleRow.appendChild(jediLogo);

    let jediFeatures = document.createElement('div');
    jediFeatures.classList.add('features');
    jediFeatures.appendChild(createFeature('Keyword and function completions'));
    jediFeatures.appendChild(createFeature('Go-to definitions and usages'));
    this.jediSection.appendChild(jediFeatures);

    let jediSeparator = document.createElement('div');
    jediSeparator.classList.add('separator');
    this.jediSection.appendChild(jediSeparator);

    let jediLocalities = document.createElement('div');
    jediLocalities.classList.add('localities');
    jediLocalities.appendChild(createLocality('Jedi runs locally on your machine using the Jedi Python engine.', 'icon-package', 'https://github.com/davidhalter/jedi'));
    this.jediSection.appendChild(jediLocalities);

    let jediCtaRow = document.createElement('center');
    jediCtaRow.classList.add('cta-row');
    this.jediSection.appendChild(jediCtaRow)
    this.submitBtn = document.createElement('button');
    this.submitBtn.classList.add('cta-btn');
    this.submitBtn.textContent = 'Install';
    jediCtaRow.appendChild(this.submitBtn);


    // this.submitBtn = document.createElement('button');
    // this.submitBtn.classList.add('cta-btn');
    // this.submitBtn.classList.add('top');
    // this.submitBtn.textContent = 'Enable Kite';
    // ctaRow.appendChild(this.submitBtn);
    //
    // this.loader = document.createElement('span');
    // this.loader.classList.add('loading');
    // this.loader.classList.add('loading-spinner-small');
    // this.loader.classList.add('inline-block');
    // this.loader.classList.add('hidden');
    // ctaRow.appendChild(this.loader);
    //
    // this.progress = new ProgressBar({
    //   initial: 'Kite is installing...',
    //   finished: 'Kite is installed',
    // }, ['hidden']);
    // ctaRow.appendChild(this.progress.element);
    //
    // this.content = document.createElement('div');
    //
    // this.kiteDescription = document.createElement('div');
    // this.kiteDescription.innerHTML = `
    // <div data-install-copy="long">
    //   <p><strong>Cloud powered completions</strong></p>
    //   <ul>
    //     <li>More accurate, with 1.5x as many completions, generated from all the open-source code on Github.</li>
    //     <li>Shows the best completions first with algorithmic ranking based on real-world code usage.</li>
    //     <li>Twice the documentation coverage, with better formatting.</li>
    //   </ul>
    //   <p>Kite also includes a sidebar app you can use to get more information, code examples, and search.</p>
    //   <p>
    //     All this is possible because Kite analyzes your code in the cloud.
    //     <a href="http://kite.com/faq-autocomplete-python">Click here to learn more</a>.</p>
    // </div>
    // <div data-install-copy="short">
    //   <p><strong>Cloud powered completions</strong></p>
    //   <p>
    //     1.5x as many completions and 2x documentation coverage,
    //     powered by all the open-source code on Github.
    //     Kite achieves this by analyzing your code in the cloud,
    //     alongside a native app that offers more information, code examples,
    //     and search.
    //     <a href="http://kite.com/faq-autocomplete-python">Click here to learn more</a>.</p>
    // </div>
    // <div class="screenshot"></div>
    // `;
    //
    // this.submitBtnB = document.createElement('button');
    // this.submitBtnB.classList.add('cta-btn');
    // this.submitBtnB.classList.add('bottom');
    // this.submitBtnB.classList.add('redshit');
    // this.submitBtnB.classList.add('centered');
    // this.submitBtnB.textContent = 'Enable Kite';
    // this.kiteDescription.appendChild(this.submitBtnB);
    //
    // this.kiteSection.appendChild(this.kiteDescription);
    //
    // this.element.appendChild(this.content);
    //
    // let sepRow = document.createElement('div');
    // sepRow.classList.add('kite');
    // sepRow.classList.add('row');
    // sepRow.classList.add('vertical-align');
    // sepRow.classList.add('separator');
    // this.content.appendChild(sepRow);
    //
    // let rightSep = document.createElement('div');
    // rightSep.classList.add('separator-border');
    // sepRow.appendChild(rightSep);
    //
    // let sepText = document.createElement('div');
    // sepText.classList.add('separator-text');
    // sepText.textContent = 'or';
    // sepRow.appendChild(sepText);
    //
    // let leftSep = document.createElement('div');
    // leftSep.classList.add('separator-border');
    // sepRow.appendChild(leftSep);
    //
    // let classicSection = document.createElement('div');
    // classicSection.classList.add('section');
    // this.content.appendChild(classicSection);
    //
    // let skipRow = document.createElement('div');
    // skipRow.classList.add('kite');
    // skipRow.classList.add('row');
    // skipRow.classList.add('vertical-align');
    // skipRow.classList.add('cta-row');
    // classicSection.appendChild(skipRow);
    //
    // let skipLabel = document.createElement('div');
    // skipLabel.classList.add('label');
    // skipLabel.textContent = 'Local engine';
    // skipRow.appendChild(skipLabel);
    //
    // this.skipBtn = document.createElement('button');
    // this.skipBtn.classList.add('cta-btn');
    // this.skipBtn.classList.add('top');
    // this.skipBtn.classList.add('secondary-cta');
    // this.skipBtn.textContent = 'Enable local engine';
    // skipRow.appendChild(this.skipBtn);
    //
    // let skipDescription = document.createElement('div');
    // let skipParagraph = document.createElement('p');
    // skipParagraph.textContent =
    //   'Use local code analysis engine (lower accuracy, less complete).';
    // skipDescription.appendChild(skipParagraph);
    // this.skipBtnB = document.createElement('button');
    // this.skipBtnB.classList.add('cta-btn');
    // this.skipBtnB.classList.add('bottom');
    // this.skipBtnB.classList.add('centered');
    // this.skipBtnB.classList.add('secondary-cta');
    // this.skipBtnB.textContent = 'Enable local engine';
    // skipDescription.appendChild(this.skipBtnB);
    // classicSection.appendChild(skipDescription);
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
    // this.submitBtn.onclick = func;
    // this.submitBtnB.onclick = func;
  }

  onSkip(func) {
    // this.skipBtn.onclick = func;
    // this.skipBtnB.onclick = func;
  }
};

function createFeature(descr) {
  let checkContainer = document.createElement('div');
  checkContainer.classList.add('check');
  let check = document.createElement('span');
  check.classList.add('icon');
  check.classList.add('icon-check');
  checkContainer.appendChild(check);
  let feature = document.createElement('div');
  feature.classList.add('feature');
  feature.appendChild(checkContainer);
  let featureDescr = document.createElement('div');
  featureDescr.classList.add('description');
  featureDescr.textContent = descr;
  feature.appendChild(featureDescr);
  return feature;
}

function createLocality(descr, icon, url) {
  let checkContainer = document.createElement('div');
  checkContainer.classList.add('check');
  let check = document.createElement('span');
  check.classList.add('icon');
  check.classList.add(icon);
  checkContainer.appendChild(check);
  let locality = document.createElement('div');
  locality.classList.add('locality');
  locality.appendChild(checkContainer);
  let localityDescr = document.createElement('div');
  localityDescr.classList.add('description');
  localityDescr.textContent = descr + ' ';
  let link = document.createElement('a');
  link.href = url;
  link.textContent = 'Learn more.';
  localityDescr.appendChild(link);
  locality.appendChild(localityDescr);
  return locality;
}

module.exports = InstallStep;
