'use strict';

var os = require('os');
const mixpanel = require('mixpanel');
const crypto = require('crypto');
const kitePkg = require('../../package.json');

const MIXPANEL_TOKEN = 'fb6b9b336122a8b29c60f4c28dab6d03';

const OS_VERSION = os.type() + ' ' + os.release();

const client = mixpanel.init(MIXPANEL_TOKEN, {
  protocol: 'https',
});

const EDITOR_UUID = localStorage.getItem('metrics.userId');

// Generate a unique ID for this user and save it for future use.
function distinctID() {
  localStorage.getItem('metrics.userId');
}

// Send an event to mixpanel
function track(eventName, properties) {
  var eventData = {
    distinct_id: EDITOR_UUID,
    editor_uuid: EDITOR_UUID,
    editor: "atom",
    atom_version: atom.getVersion(),
    kite_plugin_version: kitePkg.version,
    os: OS_VERSION,
  };
  for (var key in properties || {}) {
    eventData[key] = properties[key];
  }
  if (!DEBUG) {
    client.track(eventName, eventData);
  } else {
    console.log(`tracking ${ eventName }:`, eventData);
  }
}

var Tracker = {
  name: null,
  props: null,
  trackEvent: function(eventName, extras) {
    extras = extras || {};
    for (var key in this.props) {
      extras[key] = this.props[key];
    }
    track(`${ this.name } - ${ eventName }`, extras);
  },
};

module.exports = {
  track: track,
  Tracker: Tracker,
};
