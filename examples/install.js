module.exports = () => {
  const AccountManager = require('../lib/account-manager');
  const Logger = require('../lib/logger');
  const Install = require('../lib/install');
  const GetEmail = require('../lib/install/get-email');
  const PassStep = require('../lib/install/pass-step');
  const CheckEmail = require('../lib/install/check-email');
  const InputEmail = require('../lib/install/input-email');
  const Login = require('../lib/install/login');
  const BranchStep = require('../lib/install/branch-step');
  const ParallelSteps = require('../lib/install/parallel-steps');

  const InstallElement = require('../lib/elements/atom/install-element');
  const InputEmailElement = require('../lib/elements/atom/input-email-element');
  const LoginElement = require('../lib/elements/atom/login-element');

  const install = new Install([
    new GetEmail({name: 'get-email'}),
    new InputEmail(new InputEmailElement(), {name: 'input-email'}),
    new BranchStep([
      {match: () => true, step: new PassStep()},
      {match: () => false, step: new PassStep()},
    ], {
      name: 'branch-test',
    }),
    new CheckEmail({name: 'check-email', retryStep: 'input-email'}),
  ]);

  Logger.LEVEL = Logger.LEVELS.VERBOSE;

  AccountManager.initClient('alpha.kite.com', -1, true);

  atom.workspace.getActivePane().addItem(install);
  atom.workspace.getActivePane().activateItem(install);

  install.start()
  .then(result => console.log(result))
  .catch(err => console.error(err));
};
