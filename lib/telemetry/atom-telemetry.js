var crypto = require('crypto');
var os = require('os');
var path = require('path');
var telemetry = require('./telemetry.js');

var EXTENSIONS = ["go","js","cpp","java","py","php","m","h","scala","c","cs","pl","rb","sh","html","less","css","md","asp","aspx","cfm","yaws","swf","htm","xhtml","jsp","jspx","do","action","php4","php3","xml","svg","coffee","_coffee","rhtml","jsx"];

var AtomTelemetry = {
  name: null,
  telemetry: telemetry,

  getData: function() {
    return {
      protocolVersion: 0,
      addresses: getAddresses(),
      os: os.platform(),
      osVersion: os.release(),
      editor: "atom",
      editorUUID: localStorage.getItem('metrics.userId'),
      activeNonBundledPackageNames: getPackages(),
      activeEditorFileExtension: getActiveExtension(),
    }
  },

  observeEditor: function(editor) {
    editor.onDidChange(this.onModified.bind(this, editor));
    editor.onDidChangeSelectionRange(this.onSelectionModified.bind(this, editor));
  },

  onModified: function(editor) {
    this.onSelectionModified(editor);
  },

  onSelectionModified: function(editor) {
    this.activity = true;
    var ext = path.extname(editor.getPath()).substr(1);
    var grammer = editor.getGrammar().name;
    if (ext === "py" || grammer === "Python") {
      this.pyActivity = true;
    }
  },

  setName: function(name) {
    this.telemetry.setName(name);
  },

  run: function() {
    this.telemetry.setGetStaticData(this.getData.bind(this));
    this.telemetry.run();
  },

  stop: function() {
    this.telemetry.stop();
  },
};

// Helper functions

var getAddresses = function() {
  var hashedAddresses = [];
  var sha1 = crypto.createHash("sha1");
  var addresses = os.networkInterfaces();
  for (var key in addresses) {
    if (key && key.startsWith("en")) {
      Array.prototype.push.apply(hashedAddresses, addresses[key].map(function(addr) {
        return sha1.update(addr.mac).digest("hex");
      }));
    }
  }
  return hashedAddresses;
};


var getPackages = function() {
  var packages = [];
  atom.packages.getActivePackages().forEach((pkg) => {
    if (!pkg.bundledPackage && pkg.name !== null) {
      packages.push(pkg.name);
    }
  });
  return packages.sort();
};

var getActiveExtension = function() {
  var editor = atom.workspace.getActiveTextEditor();
  if (!editor) {
    return;
  }
  var ext = path.extname(editor.getPath()).substr(1);
  if (EXTENSIONS.indexOf(ext) === -1) {
    ext = null;
  }
  return ext;
};

module.exports = {
  telemetry: AtomTelemetry,
  activate: function() {
    atom.workspace.observeTextEditors(this.telemetry.observeEditor.bind(this.telemetry));
    this.telemetry.run();
  },
  rename: function(name) {
    this.telemetry.name = name;
  },
  deactivate: function() {
    this.telemetry.stop();
  },
}
