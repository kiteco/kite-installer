const os = require('os');

module.exports = () => {
  const AccountManager = require('../lib/account-manager');
  const Authenticate = require('../lib/install/authenticate');
  const BranchStep = require('../lib/install/branch-step');
  const CheckEmail = require('../lib/install/check-email');
  const CreateAccount = require('../lib/install/create-account');
  const Download = require('../lib/install/download');
  const Flow = require('../lib/install/flow');
  const GetEmail = require('../lib/install/get-email');
  const InputEmail = require('../lib/install/input-email');
  const Install = require('../lib/install');
  const InstallPlugin = require('../lib/install/install-plugin');
  const KiteVsJedi = require('../lib/install/kite-vs-jedi');
  const Logger = require('../lib/logger');
  const Login = require('../lib/install/login');
  const ParallelSteps = require('../lib/install/parallel-steps');
  const VoidStep = require('../lib/install/void-step');
  const Whitelist = require('../lib/install/whitelist');
  const WhitelistChoice = require('../lib/install/whitelist-choice');

  const InputEmailElement = require('../lib/elements/atom/input-email-element');
  const InstallEndElement = require('../lib/elements/atom/install-end-element');
  const InstallErrorElement = require('../lib/elements/atom/install-error-element');
  const KiteVsJediElement = require('../lib/elements/atom/kite-vs-jedi-element');
  const LoginElement = require('../lib/elements/atom/login-element');
  const WhitelistElement = require('../lib/elements/atom/whitelist-element');

  require('../lib/elements/atom/install-element');

  const install = new Install([
    new KiteVsJedi({
      name: 'kite-vs-jedi',
      view: new KiteVsJediElement(),
    }),
    new GetEmail({name: 'get-email'}),
    new InputEmail({
      name: 'input-email',
      view: new InputEmailElement(),
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
          view: new LoginElement(),
          failureStep: 'account-switch',
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
      ], {name: 'download-flow'}),
      new WhitelistChoice({
        name: 'whitelist-choice',
        view: new WhitelistElement(),
      }),
    ], {
      name: 'download-and-whitelist',
    }),
    new Whitelist({name: 'whitelist'}),
    new InstallPlugin({name: 'install-plugin'}),
    new BranchStep([
      {
        match: (data) => !data.error,
        step: new VoidStep({
          name: 'end',
          view: new InstallEndElement(),
        }),
      }, {
        match: (data) => data.error,
        step: new VoidStep({
          name: 'error',
          view: new InstallErrorElement(),
        }),
      },
    ], {name: 'termination'}),
  ], {
    path: atom.project.getPaths()[0] || os.homedir(),
  }, {
    failureStep: 'termination',
  });

  Logger.LEVEL = Logger.LEVELS.DEBUG;

  AccountManager.initClient('alpha.kite.com', -1, true);

  atom.workspace.getActivePane().addItem(install);
  atom.workspace.getActivePane().activateItem(install);

  install.start()
  .then(result => console.log(result))
  .catch(err => console.error(err));
};
