'use strict';

var os = require('os');
const crypto = require('crypto');
const mixpanel = require('mixpanel');

const localconfig = require('./localconfig');
const kitePkg = require('../../package.json');
const Logger = require('../../lib/logger');
const {DEBUG} = require('../../lib/constants');

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
    editor: 'atom',
    atom_version: atom.getVersion(),
    kite_plugin_version: kitePkg.version,
    os: OS_VERSION,
  };
  for (var key in properties || {}) {
    eventData[key] = properties[key];
  }
  Logger.debug('mixpanel:', eventName, eventData);
  if (!DEBUG) {
    client.track(eventName, eventData);
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
  enabled: true,
  distinctID,
  track,
  Tracker,
};
