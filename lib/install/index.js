
const Authenticate = require('./authenticate');
const BranchStep = require('./branch-step');
const CheckEmail = require('./check-email');
const CreateAccount = require('./create-account');
const Download = require('./download');
const Flow = require('./flow');
const GetEmail = require('./get-email');
const InputEmail = require('./input-email');
const Install = require('../install');
const KiteVsJedi = require('./kite-vs-jedi');
const Login = require('./login');
const ParallelSteps = require('./parallel-steps');
const VoidStep = require('./void-step');
const Whitelist = require('./whitelist');
const WhitelistChoice = require('./whitelist-choice');

module.exports = {
  Authenticate,
  BranchStep,
  CheckEmail,
  CreateAccount,
  Download,
  Flow,
  GetEmail,
  InputEmail,
  Install,
  KiteVsJedi,
  Login,
  ParallelSteps,
  VoidStep,
  Whitelist,
  WhitelistChoice,

  atom: () => {
    const InstallElement = require('../elements/atom/install-element');
    const InputEmailElement = require('../elements/atom/input-email-element');
    const InstallEndElement = require('../elements/atom/install-end-element');
    const InstallErrorElement = require('../elements/atom/install-error-element');
    const KiteVsJediElement = require('../elements/atom/kite-vs-jedi-element');
    const LoginElement = require('../elements/atom/login-element');
    const WhitelistElement = require('../elements/atom/whitelist-element');
    const InstallPlugin = require('./install-plugin');

    return {
      InstallElement,
      InputEmailElement,
      InstallEndElement,
      InstallErrorElement,
      KiteVsJediElement,
      LoginElement,
      WhitelistElement,
      InstallPlugin,

      defaultFlow: () => {
        return [
          new GetEmail({name: 'get-email'}),
          new InputEmail({
            name: 'input-email',
            view: new InputEmailElement('kite_installer_input_email_step'),
          }),
          new CheckEmail({
            name: 'check-email',
            failureStep: 'input-email',
          }),
          new BranchStep([
            {
              match: (data) => data.account.exists,
              step: new Login({
                name: 'login',
                view: new LoginElement('kite_installer_login_step'),
                failureStep: 'account-switch',
                backStep: 'input-email',
              }),
            }, {
              match: (data) => !data.account.exists,
              step: new CreateAccount({name: 'create-account'}),
            },
          ], {
            name: 'account-switch',
          }),
          new ParallelSteps([
            new Flow([
              new Download({name: 'download'}),
              new Authenticate({name: 'authenticate'}),
              new InstallPlugin({name: 'install-plugin'}),
            ], {name: 'download-flow'}),
            new WhitelistChoice({
              name: 'whitelist-choice',
              view: new WhitelistElement('kite_installer_whitelist_step'),
            }),
          ], {
            name: 'download-and-whitelist',
          }),
          new Whitelist({name: 'whitelist'}),
          new BranchStep([
            {
              match: (data) => !data.error,
              step: new VoidStep({
                name: 'end',
                view: new InstallEndElement('kite_installer_install_end_step'),
              }),
            }, {
              match: (data) => data.error,
              step: new VoidStep({
                name: 'error',
                view: new InstallErrorElement('kite_installer_install_error_step'),
              }),
            },
          ], {name: 'termination'}),
        ];
      },

      autocompletePythonFlow: () => {
        return [
          new KiteVsJedi({
            name: 'kite-vs-jedi',
            view: new KiteVsJediElement('kite_installer_choose_kite_step'),
          }),
          new GetEmail({name: 'get-email'}),
          new InputEmail({
            name: 'input-email',
            view: new InputEmailElement('kite_installer_input_email_step'),
          }),
          new CheckEmail({
            name: 'check-email',
            failureStep: 'input-email',
          }),
          new BranchStep([
            {
              match: (data) => data.account.exists,
              step: new Login({
                name: 'login',
                view: new LoginElement('kite_installer_login_step'),
                failureStep: 'account-switch',
                backStep: 'input-email',
              }),
            }, {
              match: (data) => !data.account.exists,
              step: new CreateAccount({name: 'create-account'}),
            },
          ], {
            name: 'account-switch',
          }),
          new ParallelSteps([
            new Flow([
              new Download({name: 'download'}),
              new Authenticate({name: 'authenticate'}),
              new InstallPlugin({name: 'install-plugin'}),
            ], {name: 'download-flow'}),
            new WhitelistChoice({
              name: 'whitelist-choice',
              view: new WhitelistElement('kite_installer_whitelist_step'),
            }),
          ], {
            name: 'download-and-whitelist',
          }),
          new Whitelist({name: 'whitelist'}),
          new BranchStep([
            {
              match: (data) => !data.error,
              step: new VoidStep({
                name: 'end',
                view: new InstallEndElement('kite_installer_install_end_step'),
              }),
            }, {
              match: (data) => data.error,
              step: new VoidStep({
                name: 'error',
                view: new InstallErrorElement('kite_installer_install_error_step'),
              }),
            },
          ], {name: 'termination'}),
        ];
      }
    };
  },
};
