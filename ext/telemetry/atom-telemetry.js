'use strict';

var crypto = require('crypto');
var os = require('os');
var path = require('path');
var Telemetry = require('./telemetry.js');

var config = require('./config.json');
var EXTENSIONS = config.extensions;

class AtomTelemetry extends Telemetry {

  getStaticData() {
    return {
      protocolVersion: 1,
      addresses: getAddresses(),
      os: os.platform(),
      osVersion: os.release(),
      editor: 'atom',
      editorUUID: localStorage.getItem('metrics.userId'),
      activeNonBundledPackageNames: getPackages(),
      activeEditorFileExtension: getActiveExtension(),
    };
  }

  observeEditor(editor) {
    editor.onDidChange(this.onModified.bind(this, editor));
    editor.onDidChangeSelectionRange(this.onSelectionModified.bind(this, editor));
  }

  onModified(editor) {
    this.onSelectionModified(editor);
  }

  onSelectionModified(editor) {
    this.setActive();
    var ext = path.extname(editor.getPath()).substr(1);
    var grammer = editor.getGrammar().name;
    if (ext === 'py' || grammer === 'Python') {
      this.setPythonActive();
    }
  }

  setName(name) {
    this.telemetry.setName(name);
  }

  run() {
    atom.workspace.observeTextEditors(this.observeEditor.bind(this));
    super.run();
  }
}

// Helper functions

var getAddresses = function() {
  var hashedAddresses = [];
  var sha1 = crypto.createHash('sha1');
  var addresses = os.networkInterfaces();
  for (var key in addresses) {
    if (key.startsWith('en')) {
      Array.prototype.push.apply(hashedAddresses, addresses[key].map(function(addr) {
        return sha1.update(addr.mac.replace(/:/g, '')).digest('hex');
      }));
    }
  }
  return hashedAddresses;
};


var getPackages = function() {
  var packages = [];
  atom.packages.getActivePackages().forEach((pkg) => {
    // we only want non-bundled packages and packages from apm
    if (!pkg.bundledPackage && pkg.name !== null && '_from' in pkg.metadata) {
      packages.push(pkg.name);
    }
  });
  return packages.sort();
};

var getActiveExtension = function() {
  var editor = atom.workspace.getActiveTextEditor();
  if (!editor) {
    return undefined;
  }
  var ext = path.extname(editor.getPath()).substr(1);
  if (EXTENSIONS.indexOf(ext) === -1) {
    ext = null;
  }
  return ext;
};

module.exports = AtomTelemetry;
