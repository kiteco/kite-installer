'use strict';

const fs = require('fs');
const os = require('os');

const Client = require('./client');
const StateController = require('./state-controller');
const KiteError = require('./kite-error');
const utils = require('./utils');

class DecisionMaker {
  constructor(editor, plugin) {
    this.editor = editor;
    this.plugin = plugin;
    this.client = new Client('plugins.kite.com', -1, '', true);
    this.path = '/' + editor.name + '/events';
  }

  shouldOfferKite(event, timeout) {
    event = event || '';
    timeout = timeout || null;

    const content = JSON.stringify({
      event,
      editorUUID: this.editor.UUID,
      editor: this.editor.name,
      os: os.platform(),
      osVersion: os.release(),
      arch: StateController.arch(),
      admin: StateController.isAdmin(),
      plugin: this.plugin.name,
      kiteInstalled: fs.existsSync(StateController.installPath),
      atomPluginInstalled: atom.packages.getLoadedPackage('kite') != null,
    });

    return this.client.request({
      path: this.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(content),
      },
    }, content, timeout)
    .catch(err => {
      throw new KiteError('http_error', err, content);
    })
    .then(resp => {
      if (resp.statusCode !== 200) {
        throw new KiteError('bad_status', resp.statusCode, content);
      }
      return utils.handleResponseData(resp);
    })
    .then((data) => {
      const result = utils.parseJSON(data, {});
      if (result.decision) {
        return result.variant;
      } else {
        throw new KiteError('denied', result, content);
      }
    });
  }
}

module.exports = DecisionMaker;
