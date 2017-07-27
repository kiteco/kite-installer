'use strict';

var InstallStep = class {
  constructor(classes) {
    classes = classes || [];
    this.element = document.createElement('div');
    this.element.classList.add('install-step');
    classes.forEach((c) => this.element.classList.add(c));

    this.comparisonSection = document.createElement('div');
    this.comparisonSection.classList.add('comparison');
    this.element.appendChild(this.comparisonSection);

    // Jedi
    this.jediSection = document.createElement('div');
    this.jediSection.classList.add('section');
    this.jediSection.classList.add('highlighted-section');

    this.comparisonSection.appendChild(this.jediSection);

    let jediTitleRow = document.createElement('div');
    jediTitleRow.classList.add('kite');
    jediTitleRow.classList.add('row');
    jediTitleRow.classList.add('vertical-align');
    jediTitleRow.classList.add('title-row');
    this.jediSection.appendChild(jediTitleRow);

    let jediLogo = document.createElement('div');
    jediLogo.classList.add('inline');
    jediLogo.classList.add('logo');
    jediLogo.textContent = 'Jedi';
    jediTitleRow.appendChild(jediLogo);

    let jediTagline = document.createElement('div');
    jediTagline.classList.add('tagline');
    jediTagline.textContent = 'Local Engine';
    jediTitleRow.appendChild(jediTagline);

    let jediFeatures = document.createElement('div');
    jediFeatures.classList.add('features');
    jediFeatures.appendChild(createFeature('Keyword and function completions'));
    jediFeatures.appendChild(createFeature('Go-to definitions'));
    jediFeatures.appendChild(createFeature('Usages'));
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
    this.skipBtn = document.createElement('button');
    this.skipBtn.classList.add('cta-btn');
    this.skipBtn.textContent = 'Install';
    jediCtaRow.appendChild(this.skipBtn);

    // Kite
    this.kiteSection = document.createElement('div');
    this.kiteSection.classList.add('section');
    this.kiteSection.classList.add('highlighted-section');

    this.comparisonSection.appendChild(this.kiteSection);

    let kiteTitleRow = document.createElement('div');
    kiteTitleRow.classList.add('kite');
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

    let kiteTagline = document.createElement('div');
    kiteTagline.classList.add('tagline');
    kiteTagline.textContent = 'Cloud Powered';
    kiteTitleRow.appendChild(kiteTagline);

    let kiteFeatures = document.createElement('div');
    kiteFeatures.classList.add('features');
    kiteFeatures.appendChild(createFeature('Ranked keyword and function completions'));
    kiteFeatures.appendChild(createFeature('1.5x more completions'));
    kiteFeatures.appendChild(createFeature('Docs and examples from StackOverflow and GitHub'));
    kiteFeatures.appendChild(createFeature('Go-to definitions'));
    kiteFeatures.appendChild(createFeature('Usages and search (Paid features)'));
    this.kiteSection.appendChild(kiteFeatures);

    let kiteSeparator = document.createElement('div');
    kiteSeparator.classList.add('separator');
    this.kiteSection.appendChild(kiteSeparator);

    let kiteLocalities = document.createElement('div');
    kiteLocalities.classList.add('localities');
    kiteLocalities.appendChild(createLocality('Kite comes with a native app that syncs your code to the cloud, where it is analyzed to give you more results.', 'icon-cloud-upload', 'https://kite.com/blog/faq-autocomplete-python?source=autocomplete-python'));
    this.kiteSection.appendChild(kiteLocalities);

    let kiteCtaRow = document.createElement('center');
    kiteCtaRow.classList.add('cta-row');
    this.kiteSection.appendChild(kiteCtaRow)
    this.submitBtn = document.createElement('button');
    this.submitBtn.classList.add('cta-btn');
    this.submitBtn.textContent = 'Install and signup';
    kiteCtaRow.appendChild(this.submitBtn);

    // Loading indicator
    this.loadingSection = document.createElement('div');
    this.loadingSection.classList.add('kite');
    this.loadingSection.classList.add('row');
    this.loadingSection.classList.add('loading-row');
    this.loadingSection.classList.add('hidden');

    let loadingLogo = document.createElement('div');
    loadingLogo.classList.add('inline');
    loadingLogo.classList.add('logo');
    loadingLogo.classList.add('kite');
    loadingLogo.textContent = 'Kite';
    this.loadingSection.appendChild(loadingLogo);

    this.loadingMsg = document.createElement('div');
    this.loadingMsg.classList.add('kite');
    this.loadingMsg.classList.add('row');
    this.loadingMsg.classList.add('loading-message');
    this.loadingSection.appendChild(this.loadingMsg);

    this.loader = document.createElement('div');
    this.loader.classList.add('loading');
    this.loader.classList.add('loading-spinner-small');
    this.loader.classList.add('inline-block');
    this.loadingMsg.appendChild(this.loader);

    let msg = document.createElement('div');
    msg.classList.add('message');
    msg.textContent = 'Kite is installing...';
    this.loadingMsg.appendChild(msg);

    this.element.appendChild(this.loadingSection);
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

  showProgress() {
    this.comparisonSection.classList.add('hidden');
    this.loadingSection.classList.remove('hidden');
  }

  onSubmit(func) {
    this.submitBtn.onclick = func;
  }

  onSkip(func) {
    this.skipBtn.onclick = func;
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
