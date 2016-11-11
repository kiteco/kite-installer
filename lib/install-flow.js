const InstallStep = require('./install-step.js');
const CreateAccountStep = require('./create-account-step.js');
const LoginStep = require('./login-step.js');
const WhitelistStep = require('./whitelist-step.js');

var InstallFlow = class {
  static get STATES() {
    return {
      STARTED: 0,
      CREATE_ACCOUNT: 1,
      LOGIN: 2,
      WHITELIST: 3,
      WHITELISTED: 4,
    };
  }

  constructor(classes=[]) {
    this.element = document.createElement('div');
    this.element.classList.add('install-flow');
    this.element.classList.add('native-key-bindings');
    classes.push('install-flow-step');

    this.state = InstallFlow.STATES.STARTED;

    this.installStep = new InstallStep({}, {
      initial: "Installing...",
      finished: "Kite is installed",
    }, classes);
    this.element.appendChild(this.installStep.element);

    var hidden = classes.concat(['hidden']);
    this.createAccountStep = new CreateAccountStep({}, hidden);
    this.element.appendChild(this.createAccountStep.element);

    this.loginStep = new LoginStep({}, hidden);
    this.element.appendChild(this.loginStep.element);

    this.whitelistStep = new WhitelistStep({}, hidden);
    this.element.appendChild(this.whitelistStep.element);
  }

  destroy() {
    this.installStep.destroy();
    this.createAccountStep.destroy();
    this.loginStep.destroy();
    this.whitelistStep.destroy();
    this.element.remove();
  }

  onInstall(func) {
    this.installStep.onSubmit(func);
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

  onWhitelist(func) {
    this.whitelistStep.onSubmit(func);
  }

  showCreateAccount(email=null) {
    if (this.state !== InstallFlow.STATES.STARTED &&
        this.state !== InstallFlow.STATES.LOGIN) {
      return;
    }
    this.installStep.showProgress();
    if (email) {
      this.createAccountStep.setEmail(email);
    }
    this.loginStep.hide();
    this.whitelistStep.hide();
    this.createAccountStep.show();
    this.state = InstallFlow.STATES.CREATE_ACCOUNT;
  }

  showLogin() {
    if (this.state !== InstallFlow.STATES.CREATE_ACCOUNT) {
      return;
    }
    if (this.createAccountStep.email.value) {
      this.loginStep.setEmail(this.createAccountStep.email.value);
    }
    this.createAccountStep.hide();
    this.whitelistStep.hide();
    this.loginStep.show();
    this.state = InstallFlow.STATES.LOGIN;
  }

  accountValidated(info={}) {
    if (this.state !== InstallFlow.STATES.CREATE_ACCOUNT &&
        this.state !== InstallFlow.STATES.LOGIN) {
      return;
    }
    this.createAccountStep.hide();
    this.loginStep.hide();
    this.whitelistStep.setEmail(info.email);
    this.whitelistStep.setPath(info.path);
    this.whitelistStep.show();
    this.state = InstallFlow.STATES.WHITELIST;
  }

  whitelisted(text) {
    if (this.state !== InstallFlow.STATES.WHITELIST) {
      return;
    }
    this.whitelistStep.setFinished(text);
    this.state = InstallFlow.STATES.WHITELISTED;
  }
};

module.exports = InstallFlow;
