var Installer = require('./installer.js');
var InstallFlow = require('./elements/install-flow.js');
var StateController = require('./state-controller.js');

var utils = require('./utils.js');

var TestModel = class {
  constructor() { }
  getTitle() {
    return "Test";
  }
};

var findModel = (m) => {
  return document.createElement('div');
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
      this.installFlowPanel = atom.workspace.addRightPanel({
        item: this.installFlow.element,
        visible: true,
      });
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
