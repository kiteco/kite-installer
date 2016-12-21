'use strict';

var os = require('os');

var Client = require('../lib/client.js');
var utils = require('../lib/utils.js');

var DecisionMaker = class {
  constructor(editor, plugin) {
    this.editor = editor;
    this.plugin = plugin;
    this.client = new Client('plugins.kite.com', -1, '', true);
    this.path = '/' + editor.name + '/events';
  }

  shouldOfferKite(event, timeout) {
    timeout = timeout || null;
    return new Promise((resolve, reject) => {
      var content = JSON.stringify({
        event: event,
        editorUUID: this.editor.UUID,
        editor: this.editor.name,
        os: os.platform(),
        osVersion: os.release(),
        plugin: this.plugin.name,
      });

      var timeoutOpts = null;
      if (timeout !== null) {
        timeoutOpts = {
          msecs: timeout,
          callback: () => {
            reject({
              type: 'timeout',
              data: content,
            });
          }
        };
      }

      var req = this.client.request({
        path: this.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(content),
        },
      }, (resp) => {
        if (resp.statusCode !== 200) {
          reject({
            type: 'bad_status',
            data: resp.statusCode,
            content: content,
          });
          return;
        }
        utils.handleResponseData(resp, (data) => {
          try {
            var result = JSON.parse(data);
            if (result.decision) {
              resolve(result.variant);
            } else {
              reject({
                type: 'denied',
                data: result,
                content: content,
              });
            }
          } catch(e) {
            reject({
              type: 'bad_response',
              data: data,
              content: content,
            });
          }
        });
      }, content, timeoutOpts);
      req.on('error', (err) => {
        reject({
          type: 'http_error',
          data: err,
          content: content
        });
      });
    });
  }
};

module.exports = DecisionMaker;
