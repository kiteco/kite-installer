var AccountManager = require('../lib/account-manager.js');
var DecisionMaker = require('../ext/decision-maker.js');
var Installer = require('../lib/installer.js');
var Installation = require('../lib/models/installation.js');
var StateController = require('../lib/state-controller.js');

var metrics = require('../ext/telemetry/metrics.js');

DEBUG = true;

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
    var dm = new DecisionMaker(editor, plugin);

    var throttle = dm.shouldOfferKite();
    var canInstall = StateController.canInstallKite();

    Promise.all([throttle, canInstall]).then((values) => {
      var variant = values[0];
      metrics.Tracker.name = "atom autcomplete-python install";
      metrics.Tracker.props = variant;
      this.installation = new Installation(variant);
      this.installation.accountCreated(() => {
        console.log("welcome to the future");
      });;
      this.installation.flowSkipped(() => {
        console.log("enjoy the stone ages");
      });
      var installer = new Installer();
      installer.init(this.installation.flow);
      var pane = atom.workspace.getActivePane();
      this.installation.flow.onSkipInstall(() => {
        Tracker.trackEvent("skipped kite");
        pane.destroyActiveItem();
      });
      pane.addItem(this.installation, { index: 0 });
      pane.activateItemAtIndex(0);
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
      title: "Kite Host",
      description: "Hostname of Kite server",
    },
    port: {
      type: 'integer',
      default: -1,
      title: "Kite Host Port",
      description: "Port of Kite server (set to -1 to omit)",
    },
    ssl: {
      type: 'boolean',
      default: true,
      title: "Use HTTPS",
      description: "Use HTTPS when connecting to Kite server",
    },
  },
};
