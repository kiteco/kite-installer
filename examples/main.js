var AccountManager = require('../lib/account-manager.js');
var compatibility = require('../lib/compatibility.js');
var Installer = require('../lib/installer.js');
var Installation = require('../lib/models/installation.js');
var StateController = require('../lib/state-controller.js');

var metrics = require('../ext/telemetry/metrics.js');
var errors = require('../ext/telemetry/errors.js')(metrics.Tracker);

module.exports = {
  installation: null,

  activate: function(state) {
    var hostname = atom.config.get('kite-installer.hostname');
    var port = atom.config.get('kite-installer.port');
    var ssl = atom.config.get('kite-installer.ssl');
    AccountManager.initClient(hostname, port, ssl);

    atom.views.addViewProvider(Installation, (m) => m.element);

    var editor = { UUID: 'k', name: 'atom' };
    var plugin = { name: 'kite-installer' };

    var compatible = compatibility.check();
    var canInstall = StateController.canInstallKite();

    Promise.all([compatibility, canInstall]).then((values) => {
      var variant = {};
      metrics.Tracker.name = 'atom kite-installer example';
      metrics.Tracker.props = variant;
      errors.trackUncaught();
      this.installation = new Installation(variant);
      var installer = new Installer();
      installer.init(this.installation.flow, () => {
        atom.packages.activatePackage('kite');
        errors.ignoreUncaught();
      });
      var pane = atom.workspace.getActivePane();
      this.installation.flow.onSkipInstall(() => {
        metrics.Tracker.trackEvent('skipped kite');
        errors.ignoreUncaught();
        pane.destroyActiveItem();
      });
      pane.addItem(this.installation, { index: 0 });
      pane.activateItemAtIndex(0);
    }, (err) => {
      console.log('rejected with data:', err);
    });
  },

  deactivate: function() {
    if (this.installation) {
      this.installation.destroy();
    }
  },

  config: {
    hostname: {
      type: 'string',
      default: 'alpha.kite.com',
      title: 'Kite Host',
      description: 'Hostname of Kite server',
    },
    port: {
      type: 'integer',
      default: -1,
      title: 'Kite Host Port',
      description: 'Port of Kite server (set to -1 to omit)',
    },
    ssl: {
      type: 'boolean',
      default: true,
      title: 'Use HTTPS',
      description: 'Use HTTPS when connecting to Kite server',
    },
  },
};
