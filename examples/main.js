var AccountManager = require('../lib/account-manager.js');
var Installer = require('../lib/installer.js');
var Installation = require('../lib/models/installation.js');
var StateController = require('../lib/state-controller.js');
var utils = require('../lib/utils.js');

module.exports = {
  installation: null,

  activate: function(state) {
    var hostname = atom.config.get('kite-installer.hostname');
    var port = atom.config.get('kite-installer.port');
    var ssl = atom.config.get('kite-installer.ssl');
    AccountManager.initClient(hostname, port, ssl);

    atom.views.addViewProvider(Installation, (m) => m.element);

    StateController.canInstallKite().then(() => {
      this.installation = new Installation();
      var installer = new Installer(atom.project.getPaths());
      installer.init(this.installation.flow);
      var pane = atom.workspace.getActivePane();
      this.installation.flow.onSkipInstall(() => {
        pane.destroyActiveItem();
      });
      pane.addItem(this.installation);
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
