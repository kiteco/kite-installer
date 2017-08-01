'use strict';

var InstallStep = require('./install-step.js');
var CreateAccountStep = require('./create-account-step.js');
var LoginStep = require('./login-step.js');
var WhitelistStep = require('./whitelist-step.js');

var InstallFlow = class {
  constructor(variant, classes) {
    classes = classes || [];
    this.element = document.createElement('div');
    this.element.classList.add('install-flow');
    this.element.classList.add('native-key-bindings');

    this.element.dataset.installCopy =
      variant.installCopy || 'long';
    this.element.dataset.installTitle =
      variant.installTitle || 'thankyou';
    this.element.dataset.showKiteLogo =
      variant.showKiteLogo || 'yes';
    this.element.dataset.buttonPosition =
      variant.buttonPosition || 'top';
    this.element.dataset.showScreenshot =
      variant.showScreenshot || 'yes';

    let title = document.createElement('div');
    title.classList.add('title');
    this.element.appendChild(title);

    classes.push('install-flow-step');

    this.installStep = new InstallStep(classes);
    this.element.appendChild(this.installStep.element);

    var hidden = classes.concat(['hidden', 'ignore-disabled']);
    this.createAccountStep = new CreateAccountStep(hidden);
    this.element.appendChild(this.createAccountStep.element);

    this.loginStep = new LoginStep(hidden);
    this.element.appendChild(this.loginStep.element);

    this.accountCreated = false;
    this.whitelistStep = new WhitelistStep(hidden);
    this.element.appendChild(this.whitelistStep.element);
  }

  destroy() {
    this.installStep.destroy();
    this.createAccountStep.destroy();
    this.loginStep.destroy();
    this.whitelistStep.destroy();
    this.element.remove();
  }

  enable() {
    this.element.classList.remove('disabled');
  }

  disable() {
    this.element.classList.add('disabled');
  }

  onInstall(func) {
    this.installStep.onSubmit(func);
  }

  onSkipInstall(func) {
    this.installStep.onSkip(func);
  }

  onCreateAccount(func) {
    this.createAccountStep.onSubmit(func);
  }

  onLogin(func) {
    this.loginStep.onSubmit(func);
  }

  onLoginBack(func) {
    this.loginStep.onBack(func);
  }

  onResetPassword(func) {
    this.loginStep.onReset(func);
  }

  onWhitelist(func) {
    this.whitelistStep.onSubmit(func);
  }

  onSkipWhitelist(func) {
    this.whitelistStep.onSkip(func);
  }

  showCreateAccount(email) {
    this.installStep.showProgress();
    if (email) {
      this.createAccountStep.setEmail(email);
    }
    this.loginStep.hide();
    this.whitelistStep.hide();
    this.createAccountStep.show();
  }

  showLogin() {
    if (this.createAccountStep.email.value) {
      this.loginStep.setEmail(this.createAccountStep.email.value);
    }
    this.createAccountStep.hide();
    this.whitelistStep.hide();
    this.loginStep.show();
  }

  showWhitelist(info) {
    info = info || {};
    this.accountCreated = true;
    this.createAccountStep.hide();
    this.loginStep.hide();
    this.whitelistStep.setEmail(info.email);
    this.whitelistStep.setPath(info.path);
    this.whitelistStep.show();
  }

  finishWhitelist() {
    var text = 'Kite is still installing. ' +
      'Give it a couple more seconds and you\'ll be ready to rock!';
    this.whitelistStep.setFinished(text);
    this.whitelistStep.skipLink.classList.add('hidden');
  }

  finishFlow() {
    this.installStep.loader.classList.add('hidden');
    this.element.innerHTML = `
    <div class="welcome-to-kite">
      <div class="welcome-title">
        <h3>Welcome to Kite!</h3>
        <div class="title-logo"></div>
      </div>
      <div class="warning">
        Kite is still indexing some of your Python code. You\’ll see your completions improve over the next few minutes.
      </div>
      <div class="description">
        <div class="content">
          <p>You\'ll see Kite completions when writing Python in any Kite-enabled directory.</p>
          <p><strong>Kite provides the best Python completions in the world.</strong></p>
          <ul>
            <li>1.5x more completions than local engine</li>
            <li>Completions ranked by popularity</li>
            <li>2x documentation coverage</li>
          </ul>
        </div>
        <div class="description-screenshot"></div>
      </div>
      <p>
        Kite is under active development. Expect many new features
        in the coming months, including formatted documentation,
        jump to definition, function call signatures, and many more
      </p>
      <p class="strong">
        <a href="http://localhost:46624/settings">Manage Kite's settings here</a>
      </p>
      <p class="feedback">Send us feedback at <a href="mailto:feedback@kite.com">feedback@kite.com</a></p>
    </div>
    `;
  }
};

module.exports = InstallFlow;
