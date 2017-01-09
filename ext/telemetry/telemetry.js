'use strict';

var fs = require('fs');
var os = require('os');
var http = require('http');
var path = require('path');

const PERIOD = 100; // in milliseconds
const HOSTNAME = '52.52.168.91';
const PATH = '/status';

class Telemetry {
  constructor(name) {
    this.name = name;
    this.activity = false;
    this.pyActivity = false;
    this.numMins = 0;
    this.numActivityMins = 0;
    this.numPyActivityMins = 0;
    this.minCounter = 0;
    this.intervalId = null;
  }

  everyMinute() {
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
  }

  everyHour() {
    var data = {
      name: this.name,
      numMinutes: this.numMins,
      numMinutesCoding: this.numActivityMins,
      numMinutesCodingPython: this.numPyActivityMins,
    };
    data = Object.assign(data, this.getStaticData());
    this.sendAndReset(data);
  }

  getStaticData() {
    return {};
  }

  sendAndReset(data) {
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
  }

  setActive() {
    this.activity = true;
  }

  setPythonActive() {
    this.pyActivity = true;
  }

  run() {
    if (this.name === null) {
      throw new Error('must name telemetry source');
    }
    fs.access(path.join(os.homedir(), `.${this.name}.optout`), (err) => {
      if (err) {
        this.intervalId = setInterval(this.everyMinute.bind(this), PERIOD);
      }
    });
  }

  stop() {
    clearInterval(this.intervalId);
  }
}

module.exports = Telemetry;
