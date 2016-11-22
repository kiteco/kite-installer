var fs = require('fs');
var process = require('process');
var os = require('os');
var http = require('http');
var path = require('path');

var common = require('./common.js');

var PERIOD = 60000;
var HOSTNAME = "52.52.168.91";
var PATH = "/status";
var NAME = "kite-installer";

var Telemetry = {
  name: NAME, //Default name; use `rename` below to rename
  activity: false,
  pyActivity: false,
  numMins: 0,
  numActivityMins: 0,
  numPyActivityMins: 0,
  minCounter: 0,
  intervalId: null,

  everyMinute: function() {
    this.minCounter++;
    this.numMins++;
    if (this.activity) {
      this.numActivityMins++;
    }
    if (this.pyActivity) {
      this.numPyActivityMins++;
    }
    if (this.minCounter >= 60) {
      this.minCounter = 0;
      this.everyHour();
    }
    this.activity = this.pyActivity = false;
  },

  everyHour: function() {
    var data = {
      protocolVersion: 0,
      addresses: common.getAddresses(),
      os: os.platform(),
      osVersion: os.release(),
      editor: "atom",
      editorUUID: localStorage.getItem('metrics.userId'),
      activeNonBundledPackageNames: common.getPackages(),
      name: this.name,
      activeEditorFileExtension: common.getActiveExtension(),
      numMinutes: this.numMins,
      numMinutesCoding: this.numActivityMins,
      numMinutesCodingPython: this.numPyActivityMins,
    };
    this.sendAndReset(data);
  },

  sendAndReset: function(data) {
    console.log("sending");
    var options = {
      hostname: HOSTNAME,
      port: 80,
      method: 'POST',
      path: PATH,
    };
    var req = http.request(options, (response) => {
      // if sending fails, accumulate to send in a future response
      if (response.statusCode === 200) {
        this.numMins = this.numActivityMins = this.numPyActivityMins = 0;
      }
    });
    req.write(JSON.stringify(data));
    req.end();
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

  run: function() {
    fs.access(path.join(os.homedir(), `.${this.name}.optout`), (err) => {
      if (err) {
        this.intervalId = setInterval(this.everyMinute.bind(this), PERIOD);
      }
    });
  },

  stop: function() {
    clearInterval(this.intervalId);
  },
};

module.exports = {
  telemetry: Telemetry,
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
