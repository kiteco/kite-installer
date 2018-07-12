var os = require('os');

var AccountManager = require('./account-manager');
var compatibility = require('./compatibility');
var Errors = require('../ext/telemetry/errors');
var Logger = require('kite-connector/lib/logger');
var Metrics = require('../ext/telemetry/metrics');
var StateController = require('./state-controller');
var NodeClient = require('kite-connector/lib/clients/node');
var BrowserClient = require('kite-connector/lib/clients/browser');
var utils = require('kite-connector/lib/utils');
var install = require('./install/index.js');

module.exports = {
  AccountManager: AccountManager,
  compatibility: compatibility,
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
    atom.commands.add('atom-workspace', {
      'install-kite': () => { this.startInstallFlow(); },
      'install-kite-ACP': () => { this.startInstallFlowACP(); },
    });
  };
}
