var fs = require('fs');
var process = require('process');
var os = require('os');
var http = require('http');
var path = require('path');

var common = require('./common.js');

const PERIOD = 100; // in milliseconds
const HOSTNAME = "requestb.in";
const PATH = "/status";

var Telemetry = {
  name: null,
  activity: false,
  pyActivity: false,
  numMins: 0,
  numActivityMins: 0,
  numPyActivityMins: 0,
  minCounter: 0,
  intervalId: null,
  getStaticData: null,

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
      name: this.name,
      numMinutes: this.numMins,
      numMinutesCoding: this.numActivityMins,
      numMinutesCodingPython: this.numPyActivityMins,
    };
    data = Object.assign(data, this.getStaticData());
    this.sendAndReset(data);
  },

  sendAndReset: function(data) {
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

  setActive: function() {
    this.activity = true;
  },

  setPythonActive: function() {
    this.pyActivity = true;
  },

  setName: function(name) {
    this.name = name;
  },

  setGetStaticData: function(fn) {
    this.getStaticData = fn;
  },

  run: function() {
    if (this.name === null) {
      throw new Error("must name telemetry source");
    }
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

module.exports = Telemetry;
