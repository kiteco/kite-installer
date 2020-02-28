const Authenticate = require('./authenticate');
const BranchStep = require('./branch-step');
const CheckEmail = require('./check-email');
const CreateAccount = require('./create-account');
const Download = require('./download');
const RunKiteWithCopilot = require('./runWithCopilot');
const Flow = require('./flow');
const GetEmail = require('./get-email');
const InputEmail = require('./input-email');
const Install = require('../install');
const KiteVsJedi = require('./kite-vs-jedi');
const Login = require('./login');
const ParallelSteps = require('./parallel-steps');
const PassStep = require('./pass-step');
const VoidStep = require('./void-step');

const KiteAPI = require('kite-api');

module.exports = {
  Authenticate,
  BranchStep,
  CheckEmail,
  CreateAccount,
  Download,
  RunKiteWithCopilot,
  Flow,
  GetEmail,
  InputEmail,
  Install,
  KiteVsJedi,
  Login,
  ParallelSteps,
  VoidStep,

  atom: () => {
    const InstallElement = require('../elements/atom/install-element');
    const InputEmailElement = require('../elements/atom/input-email-element');
    const InstallWaitElement = require('../elements/atom/install-wait-element');
    const InstallEndElement = require('../elements/atom/install-end-element');
    const InstallErrorElement = require('../elements/atom/install-error-element');
    const KiteVsJediElement = require('../elements/atom/kite-vs-jedi-element');
    const LoginElement = require('../elements/atom/login-element');
    const NotAdminElement = require('../elements/atom/not-admin-element');
    const InstallErrorView = require('../elements/atom/install-error-view');

    const InstallPlugin = require('./install-plugin');

    const defaultFlow = () => {
      return [
        new ParallelSteps([
          new Flow([
            new Download({name: 'download'}),
            new InstallPlugin({name: 'install-plugin'}),
            new RunKiteWithCopilot({name: 'launch-copilot'}),
          ], {name: 'download-flow'}),
          new PassStep({
            name: 'wait-step',
            view: new InstallWaitElement('kite_installer_wait_step'),
          }),
        ], {
          name: 'download-and-wait',
        }),
        new BranchStep([
          {
            match: (data) => !data.error,
            step: new VoidStep({
              name: 'end',
              view: new InstallEndElement('kite_installer_install_end_step'),
            }),
          }, 
          {
            match: (data) => data.error,
            step: new VoidStep({
              name: 'error',
              view: new InstallErrorElement('kite_installer_install_error_step'),
            }),
          },
        ], {name: 'termination'}),
      ];
    }

    const autocompletePythonFlow = () => {
      return [
        new KiteVsJedi({
          name: 'kite-vs-jedi',
          view: new KiteVsJediElement('kite_installer_choose_kite_step'),
        }),
        ...defaultFlow()
      ];
    }

    return {
      InstallElement,
      InputEmailElement,
      InstallWaitElement,
      InstallEndElement,
      InstallErrorElement,
      KiteVsJediElement,
      LoginElement,
      InstallErrorView,
      InstallPlugin,

      defaultFlow,
      autocompletePythonFlow
    };
  },
};
