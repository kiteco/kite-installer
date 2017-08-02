const os = require('os');

module.exports = () => {
  const AccountManager = require('../lib/account-manager');
  const Logger = require('../lib/logger');
  const Install = require('../lib/install');
  const GetEmail = require('../lib/install/get-email');
  const Whitelist = require('../lib/install/whitelist');
  const CheckEmail = require('../lib/install/check-email');
  const InputEmail = require('../lib/install/input-email');
  const CreateAccount = require('../lib/install/create-account');
  const Login = require('../lib/install/login');
  const BranchStep = require('../lib/install/branch-step');
  // const Download = require('../lib/install/download');
  // const ParallelSteps = require('../lib/install/parallel-steps');

  const InputEmailElement = require('../lib/elements/atom/input-email-element');
  const LoginElement = require('../lib/elements/atom/login-element');
  const WhitelistElement = require('../lib/elements/atom/whitelist-element');

  require('../lib/elements/atom/install-element');

  const install = new Install([
    new GetEmail({name: 'get-email'}),
    new InputEmail({name: 'input-email', view: new InputEmailElement()}),
    new CheckEmail({name: 'check-email', failureStep: 'input-email'}),
    new BranchStep([
      {
        match: (data) => data.account.exists,
        step: new Login({
          view: new LoginElement(),
          failureStep: 'account-switch',
        }),
      }, {
        match: (data) => !data.account.exists,
        step: new CreateAccount(),
      },
    ], {
      name: 'account-switch',
    }),
    new Whitelist({
      name: 'whitelist',
      view: new WhitelistElement(),
    }),
    // new Download(),
  ], {
    path: atom.project.getPaths()[0] || os.homedir(),
  });

  Logger.LEVEL = Logger.LEVELS.VERBOSE;

  AccountManager.initClient('alpha.kite.com', -1, true);

  atom.workspace.getActivePane().addItem(install);
  atom.workspace.getActivePane().activateItem(install);

  install.start()
  .then(result => console.log(result))
  .catch(err => console.error(err));
};
