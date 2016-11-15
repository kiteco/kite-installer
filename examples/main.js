var Installer = require('../lib/installer.js');
var InstallFlow = require('../lib/elements/install-flow.js');
var StateController = require('../lib/state-controller.js');

var utils = require('../lib/utils.js');

var TestModel = class {
  constructor() { }
  getTitle() {
    return "Test";
  }
};

var findModel = (m) => {
  return window.flow.element;
};

module.exports = {
  installFlow: null,
  installFlowPanel: null,

  activate: function(state) {
    this.installFlow = new InstallFlow();
    this.installer = new Installer();
    this.installer.init(this.installFlow);

    window.state = StateController;
    window.flow = this.installFlow;
    window.installer = this.installer;

    var pane = atom.workspace.getActivePane();
    atom.views.addViewProvider(TestModel, findModel);

    StateController.canInstallKite().then(() => {
      pane.addItem(new TestModel());
    });
  },

  deactivate: function() {
    if (this.installFlowPanel) {
      this.installFlowPanel.destroy();
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
