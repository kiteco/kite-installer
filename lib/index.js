module.exports = {
  AccountManager: require('./account-manager'),
  AtomHelper: require('./atom-helper'),
  compatibility: require('./compatibility'),
  Errors: require('../ext/telemetry/errors'),
  Installation: require('./models/installation'),
  Installer: require('./installer'),
  InstallFlow: require('./elements/install-flow'),
  Logger: require('./logger'),
  Metrics: require('../ext/telemetry/metrics'),
  StateController: require('./state-controller'),
  NodeClient: require('./node-client'),
  BrowserClient: require('./browser-client'),
  utils: require('./utils'),
  testInstall: () => {
    const AccountManager = require('./account-manager');
    const Logger = require('./logger');
    const Install = require('../lib/install');
    const GetEmail = require('../lib/install/get-email');
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
      new CheckEmail({name: 'check-email', retryStep: 'input-email'}),
    ]);

    Logger.LEVEL = Logger.LEVELS.VERBOSE;

    AccountManager.initClient('alpha.kite.com', -1, true);

    atom.workspace.getActivePane().addItem(install);
    atom.workspace.getActivePane().activateItem(install);

    install.start()
    .then(result => console.log(result))
    .catch(err => console.error(err));
  },
};
