'use strict';

var os = require('os');
const crypto = require('crypto');
const mixpanel = require('mixpanel');

const localconfig = require('./localconfig');
const kitePkg = require('../../package.json');
const Logger = require('kite-connector/lib/logger');

const MIXPANEL_TOKEN = 'fb6b9b336122a8b29c60f4c28dab6d03';

const OS_VERSION = os.type() + ' ' + os.release();

const client = mixpanel.init(MIXPANEL_TOKEN, {
  protocol: 'https',
});

const EDITOR_UUID = typeof localStorage !== 'undefined'
  ? localStorage.getItem('metrics.userId')
  : undefined;

// Generate a unique ID for this user and save it for future use.
function distinctID() {
  var id = localconfig.get('distinctID');
  if (id === undefined) {
    // use the atom UUID
    id = EDITOR_UUID || crypto.randomBytes(32).toString('hex');
    localconfig.set('distinctID', id);
  }
  return id;
}

// Send an event to mixpanel
function track(eventName, properties) {
  if (!module.exports.enabled) { return; }

  var eventData = {
    distinct_id: distinctID(),
    editor_uuid: EDITOR_UUID,
    kite_installer_version: kitePkg.version,
    os_name: os.type(),
    os_release: os.release(),
  };

  if (typeof atom !== 'undefined') {
    eventData.editor = 'atom';
    eventData.editor_version = atom.getVersion();
  }

  for (var key in properties || {}) {
    eventData[key] = properties[key];
  }
  Logger.debug(`track: ${ eventName }`, eventData);
  client.track(eventName, eventData);
}

var Tracker = {
  source: null,
  props: null,
  trackEvent: function(eventName, extras) {
    extras = extras || {};
    extras.source = this.source;
    for (var key in this.props) {
      extras[key] = this.props[key];
    }
    track(eventName, extras);
  },
};

module.exports = {
  enabled: true,
  distinctID,
  track,
  Tracker,
};
