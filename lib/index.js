const os = require('os');

const AccountManager = require('./account-manager');
const Errors = require('../ext/telemetry/errors');
const Logger = require('kite-connector/lib/logger');
const Metrics = require('../ext/telemetry/metrics');
const StateController = require('./state-controller');
const NodeClient = require('kite-connector/lib/clients/node');
const BrowserClient = require('kite-connector/lib/clients/browser');
const utils = require('kite-connector/lib/utils');
const install = require('./install/index.js');

module.exports = {
  AccountManager: AccountManager,
  Errors: Errors,
  Logger: Logger,
  Metrics: Metrics,
  StateController: StateController,
  NodeClient: NodeClient,
  BrowserClient: BrowserClient,
  utils: utils,
  install: install,
};

if (typeof atom !== 'undefined') {
  const startFlow = (flow) => {
    const Install = install.Install;
    const installer = new Install(flow(), {
      path: atom.project.getPaths()[0] || os.homedir(),
    }, {
      failureStep: 'termination',
      title: 'Kite Install',
    });

    const initialClient = AccountManager.client;
    AccountManager.client = new NodeClient('alpha.kite.com', -1, '', true);

    atom.workspace.getActivePane().addItem(installer);
    atom.workspace.getActivePane().activateItem(installer);

    installer.start()
    .then(result => console.log(result))
    .catch(err => console.error(err))
    .then(() => {
      AccountManager.client = initialClient;
    });
  };

  module.exports.AtomHelper = require('./atom-helper');

  module.exports.startInstallFlow = () => {
    startFlow(install.atom().defaultFlow);
  };

  module.exports.startInstallFlowACP = () => {
    startFlow(install.atom().autocompletePythonFlow);
  };

  module.exports.activate = function(state) {
    // This package isn't intended to be loaded as a production Atom package,
    // so we'll set the environment to debug here.
    Logger.LEVEL = Logger.LEVELS.DEBUG;
    Metrics.Tracker.source = 'kite_installer_debug';

    atom.commands.add('atom-workspace', {
      'install-kite': () => { this.startInstallFlow(); },
      'install-kite-ACP': () => { this.startInstallFlowACP(); },
    });
  };
}
